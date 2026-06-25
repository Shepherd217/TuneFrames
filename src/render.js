const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const HELPER_SCRIPT = `
(function() {
  if (window._helpersInjected) return;
  window._helpersInjected = true;

  function audioBufferToWav(buffer) {
    const nc = buffer.numberOfChannels, sr = buffer.sampleRate;
    const bitDepth = 16, bps = bitDepth / 8, blockAlign = nc * bps;
    const ns = buffer.length, dataSize = ns * blockAlign;
    const total = 44 + dataSize;
    const wav = new ArrayBuffer(total);
    const view = new DataView(wav);
    const ws = (v, o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ws(view, 0, 'RIFF'); view.setUint32(4, total - 8, true);
    ws(view, 8, 'WAVE'); ws(view, 12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, nc, true); view.setUint32(24, sr, true);
    view.setUint32(28, sr * blockAlign, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, bitDepth, true);
    ws(view, 36, 'data'); view.setUint32(40, dataSize, true);
    const ch = []; for (let c = 0; c < nc; c++) ch.push(buffer.getChannelData(c));
    let off = 44;
    for (let i = 0; i < ns; i++) {
      for (let c = 0; c < nc; c++) {
        const s = Math.max(-1, Math.min(1, ch[c][i]));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        off += 2;
      }
    }
    return wav;
  }

  window.audioBufferToWav = audioBufferToWav;

  // Tone.js CDN bundle defines exports as non-writable, non-configurable getter
  // properties (rollup live-binding pattern). Direct assignment and Object.defineProperty
  // both fail to override them. Proxy on window.Tone is the only reliable intercept.
  //
  // AudioWorklet effects (Freeverb, BitCrusher, Chebyshev) fail in headless offline
  // rendering because worklet modules cannot load. The Proxy returns unity-gain
  // passthroughs for those classes when inside a Tone.Offline() call (_inOff flag).
  //
  // Reverb tracking is also done in the Proxy get trap (rather than Tone.Reverb = ...)
  // because Tone.Reverb is a non-configurable no-setter accessor — setting it would
  // violate Proxy invariants. Instances pushed to window._tfRev; awaited after main().
  window._patchToneWorklets = function() {
    if (typeof Tone === 'undefined' || window._tonePatched) return;
    window._tonePatched = true;

    const _orig = window.Tone;
    const _origOffline = _orig.Offline;

    const _mkPass = () => class extends _orig.Gain {
      constructor() { super(1); }
      // Reverb-compat stubs: some skills call await reverb.generate() or await reverb.ready.
      generate() { return Promise.resolve(this); }
      get ready() { return Promise.resolve(this); }
    };
    // Reverb included: its IR generation calls the module-internal Offline() which
    // creates a nested offline context and corrupts the outer timeline. Passthrough
    // eliminates the nested context entirely. Audio flows through; dry-signal-only
    // is acceptable for a headless render test.
    const _fx = { Freeverb: _mkPass(), BitCrusher: _mkPass(), Chebyshev: _mkPass(), Reverb: _mkPass() };

    let _inOff = false;

    const _wOffline = async function(cb, ...args) {
      _inOff = true;
      try { return await _origOffline(cb, ...args); }
      finally { _inOff = false; }
    };

    window.Tone = new Proxy(_orig, {
      get(t, p) {
        if (p === 'Offline') return _wOffline;
        if (_inOff && p in _fx) return _fx[p];
        return t[p];
      },
      set(t, p, v) {
        // Return false for non-configurable no-setter accessors to honor Proxy invariant.
        const d = Object.getOwnPropertyDescriptor(t, p);
        if (d && !d.configurable && d.get && !d.set) return false;
        try { t[p] = v; } catch(e) {}
        return true;
      }
    });
  };

  window.renderComposition = async function(wavPath) {
    // Wait for Tone.js to be ready
    let attempts = 0;
    while (typeof Tone === 'undefined' && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (typeof Tone === 'undefined') throw new Error('Tone not loaded');
    if (typeof window.audioBufferToWav !== 'function') throw new Error('audioBufferToWav not injected');

    window._patchToneWorklets();

    // Wait for TUNEFRAMES_READY if composition uses Tone.Sampler / CDN samples
    if ('TUNEFRAMES_READY' in window) {
      const signal = window.TUNEFRAMES_READY;
      if (signal && typeof signal.then === 'function') {
        await signal;
      } else {
        let waited = 0;
        while (!window.TUNEFRAMES_READY && waited < 120000) {
          await new Promise(r => setTimeout(r, 200));
          waited += 200;
        }
        if (!window.TUNEFRAMES_READY) throw new Error('TUNEFRAMES_READY timed out after 120s');
      }
    }

    let bpm = 120, duration = '12s';
    const metaEl = document.getElementById('tuneframes');
    if (metaEl) {
      // Support both JSON textContent and data-* attributes
      try {
        const txt = metaEl.textContent.trim();
        if (txt) {
          const meta = JSON.parse(txt);
          bpm = meta.bpm || 120;
          duration = meta.duration || '12s';
        }
      } catch(e) {}
      if (metaEl.dataset.bpm) bpm = parseInt(metaEl.dataset.bpm, 10) || bpm;
      if (metaEl.dataset.duration) duration = metaEl.dataset.duration || duration;
    }

    const durationSec = Math.max(Tone.Time(duration).toSeconds() + 0.5, 2);
    console.log('TuneFrames: rendering', durationSec, 's at BPM', bpm);

    const audioBuffer = await Tone.Offline(async () => {
      // Fix: MetalSynth.triggerAttackRelease calls triggerAttack(computedTime, velocity)
      // but triggerAttack(note, time, velocity) treats first arg as note and second as time,
      // so toSeconds(velocity=undefined) = 0 for every trigger. Replace TAR to call
      // _triggerEnvelopeAttack/_triggerEnvelopeRelease directly with the correct time.
      // Also bumps same-time triggers by 0.1ms to prevent StateTimeline ordering errors.
      if (typeof Tone !== 'undefined' && Tone.MetalSynth) {
        Tone.MetalSynth.prototype.triggerAttackRelease = function(duration, time, velocity) {
          const rawT = (time === undefined || time === null || +time <= 0) ? 0.05 : +time;
          const vel = velocity !== undefined ? velocity : 1;
          const dur = Tone.Time(duration).toSeconds();
          let safeT = rawT;
          try {
            if (this._oscillators && this._oscillators[0] && this._oscillators[0]._state) {
              const tl = this._oscillators[0]._state._timeline;
              if (tl && tl.length > 0 && safeT <= tl[tl.length - 1].time) {
                safeT = tl[tl.length - 1].time + 0.0001;
              }
            }
          } catch(e) {}
          this._triggerEnvelopeAttack(safeT, vel);
          // Release envelope only; stopping oscillators adds StateTimeline stop events
          // that block same-period re-triggers on rapid percussion patterns.
          if (this.envelope && typeof this.envelope.triggerRelease === 'function') {
            this.envelope.triggerRelease(safeT + dur);
          }
          return this;
        };
      }

      if (typeof main === 'function') await main();

      // Auto-start Transport so Tone.Sequence / Tone.Part patterns play.
      // Skills that already call Transport.start() inside main() are unaffected.
      if (typeof Tone !== 'undefined' && Tone.Transport && Tone.Transport.state !== 'started') {
        Tone.Transport.start(0);
      }
    }, durationSec, 1, 44100, bpm);

    console.log('TuneFrames: buffer ready', audioBuffer.duration, audioBuffer.length);

    const wavBuf = audioBufferToWav(audioBuffer);
    console.log('TuneFrames: wav size', wavBuf.byteLength);

    window.writeFile(wavPath, Array.from(new Uint8Array(wavBuf)));
    console.log('TuneFrames: file written');
    return wavBuf.byteLength;
  };
})();
`;

async function render(compositionPath, outputPath, format = 'mp3', timeout = 60000) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.setDefaultTimeout(timeout + 60000);

  page.on('pageerror', err => console.error('BROWSER ERR:', err.message));
  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));

  // Inject writeFile bridge BEFORE page load
  await page.exposeFunction('writeFile', (filePath, arrayBuffer) => {
    fs.writeFileSync(filePath, Buffer.from(new Uint8Array(arrayBuffer)));
    console.log('Node writeFile: wrote', arrayBuffer.length, 'bytes to', filePath);
  });

  // Inject helper scripts as an inline script tag before anything else loads
  await page.addInitScript({ content: HELPER_SCRIPT });

  await page.goto(`file://${path.resolve(compositionPath)}`, {
    waitUntil: 'domcontentloaded', timeout
  });

  // Wait for Tone.js to actually be available
  await page.waitForFunction(() => typeof Tone !== 'undefined', { timeout: 15000 });

  // Apply global patches before any renderComposition runs.
  // This covers skills that define their own renderComposition (e.g. audio-downtempo).
  // Apply global patches before any renderComposition runs.
  await page.evaluate(() => {
    if (typeof window._patchToneWorklets === 'function') window._patchToneWorklets();
  });

  // Also wait for our renderComposition to be defined
  await page.waitForFunction(() => typeof window.renderComposition === 'function', { timeout: 15000 });

  // Check for TUNEFRAMES_READY signal (indicates Tone.Sampler / CDN sample usage)
  const needsSampleWait = await page.evaluate(() => 'TUNEFRAMES_READY' in window);
  if (needsSampleWait) {
    console.log('Waiting for samples to load...');
  }

  const wavPath = path.resolve(outputPath.replace(/\.[^.]+$/, '.wav'));

  console.log('Starting render...');
  const wavSize = await page.evaluate(async (wavPath) => {
    return await window.renderComposition(wavPath);
  }, wavPath);

  console.log('Render complete, WAV size:', wavSize);
  await browser.close();

  if (!fs.existsSync(wavPath)) throw new Error(`WAV not written: ${wavPath}`);
  const stats = fs.statSync(wavPath);
  if (stats.size < 1000) throw new Error(`WAV too small: ${stats.size} bytes`);
  console.log(`WAV on disk: ${stats.size} bytes`);

  if (format === 'mp3') {
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-y', '-hide_banner', '-loglevel', 'error',
        '-i', wavPath, '-codec:a', 'libmp3lame', '-qscale:a', '2', outputPath
      ]);
      ff.on('close', code => {
        if (code === 0) { fs.unlinkSync(wavPath); resolve(); }
        else reject(new Error(`FFmpeg exited ${code}`));
      });
      ff.on('error', reject);
    });
    console.log(`MP3: ${fs.statSync(outputPath).size} bytes`);
  }

  return { output: outputPath };
}

module.exports = { render };
