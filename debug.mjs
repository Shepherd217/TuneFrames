import { chromium } from 'playwright';
import fs from 'fs';
import { spawn } from 'child_process';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

await page.goto(`file://${process.cwd()}/examples/example-minimal.html`, { 
  waitUntil: 'networkidle', timeout: 30000 
});

const audioData = await page.evaluate(async () => {
  try {
    let attempts = 0;
    while (typeof Tone === 'undefined' && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (typeof Tone === 'undefined') throw new Error('Tone not loaded');

    const buffer = await Tone.Offline(async () => {
      if (typeof main === 'function') await main();
    }, 2, 1, 44100, 120);

    function audioBufferToWav(buffer) {
      const numChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const bitDepth = 16;
      const bytesPerSample = bitDepth / 8;
      const blockAlign = numChannels * bytesPerSample;
      const samples = buffer.length;
      const dataSize = samples * blockAlign;
      const totalSize = 44 + dataSize;
      const wav = new ArrayBuffer(totalSize);
      const view = new DataView(wav);
      const writeString = (v, o, s) => { for (let i=0; i<s.length; i++) v.setUint8(o+i, s.charCodeAt(i)); };
      writeString(view, 0, 'RIFF');
      view.setUint32(4, totalSize - 8, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * blockAlign, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitDepth, true);
      writeString(view, 36, 'data');
      view.setUint32(40, dataSize, true);
      const ch = [];
      for (let c=0; c<numChannels; c++) ch.push(buffer.getChannelData(c));
      let offset = 44;
      for (let i=0; i<samples; i++) {
        for (let c=0; c<numChannels; c++) {
          const s = Math.max(-1, Math.min(1, ch[c][i]));
          view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
          offset += 2;
        }
      }
      return new Uint8Array(wav);
    }
    
    const wavBuffer = audioBufferToWav(buffer);
    console.log('WAV length:', wavBuffer.length);
    
    let base64 = '';
    const chunkSize = 8192;
    for (let i=0; i<wavBuffer.length; i += chunkSize) {
      const chunk = wavBuffer.subarray(i, Math.min(i+chunkSize, wavBuffer.length));
      base64 += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return { buffer: base64, duration: buffer.duration, wavLen: wavBuffer.length };
  } catch (err) {
    return { error: err.message };
  }
});

console.log('Result:', JSON.stringify(audioData, null, 2));

if (audioData.buffer) {
  const decoded = Buffer.from(audioData.buffer, 'base64');
  console.log('Decoded length:', decoded.length);
  console.log('Header bytes:', decoded.slice(0,16));
  fs.writeFileSync('/tmp/debug.wav', decoded);
  
  const ff = spawn('ffmpeg', ['-y', '-i', '/tmp/debug.wav', '/tmp/debug.mp3']);
  let stderr = '';
  ff.stderr.on('data', d => stderr += d.toString());
  ff.on('close', code => {
    console.log('FFmpeg exit:', code);
    if (code !== 0) console.log('STDERR:', stderr.slice(-300));
    else console.log('MP3 written, size:', fs.statSync('/tmp/debug.mp3').size);
  });
}

await browser.close();
