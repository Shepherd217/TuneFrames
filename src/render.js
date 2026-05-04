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

  window.renderComposition = async function(wavPath) {
    // Wait for Tone.js to be ready
    let attempts = 0;
    while (typeof Tone === 'undefined' && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (typeof Tone === 'undefined') throw new Error('Tone not loaded');
    if (typeof window.audioBufferToWav !== 'function') throw new Error('audioBufferToWav not injected');

    let bpm = 120, duration = '4n';
    const metaEl = document.getElementById('tuneframes');
    if (metaEl) {
      try {
        const meta = JSON.parse(metaEl.textContent);
        bpm = meta.bpm || 120;
        duration = meta.duration || '4n';
      } catch(e) {}
    }

    const durationSec = Math.max(Tone.Time(duration).toSeconds() + 0.5, 2);
    console.log('TuneFrames: rendering', durationSec, 's at BPM', bpm);

    const audioBuffer = await Tone.Offline(async () => {
      if (typeof main === 'function') await main();
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

async function render(compositionPath, outputPath, format = 'mp3') {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

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
    waitUntil: 'domcontentloaded', timeout: 30000
  });

  // Wait for Tone.js to actually be available
  await page.waitForFunction(() => typeof Tone !== 'undefined', { timeout: 15000 });
  
  // Also wait for our renderComposition to be defined
  await page.waitForFunction(() => typeof window.renderComposition === 'function', { timeout: 15000 });

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
