import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const fileUrl = `file://${path.resolve('examples/example-minimal.html')}`;
console.log('Loading:', fileUrl);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Capture console messages
page.on('console', msg => {
  console.log('BROWSER:', msg.type(), msg.text());
});
page.on('pageerror', err => {
  console.log('PAGE ERROR:', err.message);
});

await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });

// Test Tone.Offline directly
const result = await page.evaluate(async () => {
  console.log('Tone available:', typeof Tone !== 'undefined');
  console.log('Tone.Offline available:', typeof Tone.Offline !== 'undefined');
  
  try {
    const durationSec = Tone.Time('4n').toSeconds();
    console.log('4n =', durationSec, 'seconds');
    
    const buffer = await Tone.Offline(async () => {
      await Tone.start();
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease('C4', '4n', 0);
    }, 2, 1, 44100, 120);
    
    console.log('Buffer duration:', buffer.duration);
    console.log('Buffer samples:', buffer.length);
    console.log('Buffer channels:', buffer.numberOfChannels);
    console.log('Channel 0 samples:', buffer.getChannelData(0).length);
    
    // Check first 10 samples
    const data = buffer.getChannelData(0);
    console.log('First 10 samples:', Array.from(data.slice(0, 10)));
    
    return {
      duration: buffer.duration,
      samples: buffer.length,
      channels: buffer.numberOfChannels,
      first10: Array.from(data.slice(0, 10))
    };
  } catch (e) {
    console.log('Error:', e.message);
    console.log('Stack:', e.stack);
    return { error: e.message };
  }
});

console.log('Result:', JSON.stringify(result, null, 2));

await browser.close();
