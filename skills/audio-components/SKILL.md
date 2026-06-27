---
name: audio-components
description: Real CDN sample building blocks for all TuneFrames instruments. Copy-paste snippets for drums, bass, piano, strings, brass, guitar, and more — all pre-verified 200 OK URLs.
---

# TuneFrames Audio Components Library

Self-contained copy-paste reference for every instrument type available over CDN. Each section has the exact CDN URL, working note range, the `TUNEFRAMES_READY` pre-fetch block, and the `Tone.Offline` usage block.

**Golden rules (always apply):**
- ALL fetch calls go inside `window.TUNEFRAMES_READY` (before `Tone.Offline`)
- `await window.TUNEFRAMES_READY` inside `main()` before calling `Tone.Offline`
- Sort event arrays chronologically before scheduling
- NEVER use `Tone.Reverb`, `Tone.Freeverb`, `Tone.BitCrusher`, `Tone.Chebyshev` (AudioWorklet — headless crash)
- NEVER call `Tone.loaded()` inside `Tone.Offline` — it hangs
- Bass/strings/brass/guitar: use FLAT notation (Bb, Db, Eb) NOT sharps (As, Cs, Ds)
- Piano (Salamander): use sharp notation with 's' suffix (Ds4, Fs4) NOT flats

---

## 1. Drums — CR78 via Tone.js CDN

**Source:** `https://tonejs.github.io/audio/drum-samples/CR78/`

| Sample | URL | Size |
|--------|-----|------|
| Kick | `https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3` | 3.3 KB |
| Snare | `https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3` | 2.6 KB |
| Hi-hat | `https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3` | 3.3 KB |
| Breakbeat loop | `https://tonejs.github.io/audio/drum-samples/breakbeat.mp3` | 60 KB |

**Use `Tone.Player`, NOT `Tone.Sampler` for drums.**

### TUNEFRAMES_READY — Drums

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  const drumUrls = {
    kick:  'https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3',
    snare: 'https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3',
    hihat: 'https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3',
  };
  const drumBufs = {};
  for (const [name, url] of Object.entries(drumUrls)) {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    drumBufs[name] = await ctx.decodeAudioData(arr);
  }
  window._drumBufs = drumBufs;

  await ctx.close();
})();
```

### Tone.Offline — Drums

```javascript
// Inside Tone.Offline(async () => { ... }, duration):
const limiter = new Tone.Limiter(-1).toDestination();
const comp = new Tone.Compressor(-18, 3).connect(limiter);

const kick  = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.kick)).connect(comp);
const snare = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.snare)).connect(comp);
const hihat = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.hihat)).connect(comp);

// Helper: compute bar length in seconds at current BPM
const bps = Tone.Transport.bpm.value / 60;
const beat = 1 / bps;
const bar  = 4 * beat;

// 4-bar standard rock pattern (kick on 1&3, snare on 2&4, hihat every 8th)
const kickTimes  = [0, 2*beat, 4*beat, 6*beat, 8*beat, 10*beat, 12*beat, 14*beat].sort((a,b)=>a-b);
const snareTimes = [beat, 3*beat, 5*beat, 7*beat, 9*beat, 11*beat, 13*beat, 15*beat].sort((a,b)=>a-b);
const hihatTimes = Array.from({length: 32}, (_, i) => i * beat * 0.5).sort((a,b)=>a-b);

kickTimes.forEach(t  => Tone.Transport.schedule(time => kick.start(time),  t));
snareTimes.forEach(t => Tone.Transport.schedule(time => snare.start(time), t));
hihatTimes.forEach(t => Tone.Transport.schedule(time => hihat.start(time), t));

Tone.Transport.start();
```

### Breakbeat Loop variant

```javascript
// In TUNEFRAMES_READY (add alongside kick/snare/hihat if using loop):
const bbRes = await fetch('https://tonejs.github.io/audio/drum-samples/breakbeat.mp3');
const bbArr = await bbRes.arrayBuffer();
window._bbBuf = await ctx.decodeAudioData(bbArr);

// In Tone.Offline:
const bb = new Tone.Player(new Tone.ToneAudioBuffer(window._bbBuf)).connect(comp);
bb.loop = true;
bb.loopEnd = '1m';
Tone.Transport.schedule(time => bb.start(time), 0);
Tone.Transport.start();
```

---

## 2. Piano — Salamander Grand

**Source:** `https://tonejs.github.io/audio/salamander/`
**Format:** `NoteName.mp3` — sharp = 's' suffix (Ds4, Fs4, Gs4, As4, Cs4)
**NOT flat notation.** Files are named with 's' for sharp, not 'b' for flat.

**Full recommended note set:**
```
A1, C2, Ds2, Fs2, A2, C3, Ds3, Fs3, A3, C4, Ds4, Fs4, A4, C5, Ds5, Fs5, A5, C6
```

### TUNEFRAMES_READY — Piano

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  const PIANO_NOTES = ['A1','C2','Ds2','Fs2','A2','C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4','C5','Ds5','Fs5','A5','C6'];
  const pianoBufs = {};
  for (const note of PIANO_NOTES) {
    const res = await fetch(`https://tonejs.github.io/audio/salamander/${note}.mp3`);
    const arr = await res.arrayBuffer();
    pianoBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._pianoBufs = pianoBufs;

  await ctx.close();
})();
```

### Tone.Offline — Piano

```javascript
// Inside Tone.Offline:
const pianoUrls = {};
for (const [note, buf] of Object.entries(window._pianoBufs)) {
  pianoUrls[note] = new Tone.ToneAudioBuffer(buf);
}
const piano = new Tone.Sampler({ urls: pianoUrls }).connect(comp);

// Sort all events by time before scheduling
const pianoEvents = [
  { note: 'C4',  dur: '4n', t: 0 },
  { note: 'E4',  dur: '4n', t: Tone.Time('4n').toSeconds() },
  { note: 'G4',  dur: '4n', t: Tone.Time('2n').toSeconds() },
  { note: 'C5',  dur: '2n', t: Tone.Time('2n.').toSeconds() },
].sort((a, b) => a.t - b.t);

pianoEvents.forEach(e => piano.triggerAttackRelease(e.note, e.dur, e.t));

Tone.Transport.start();
```

### Piano gotcha — note naming

```
Salamander uses SHARP notation with 's':
  Ds4  = D#4  (correct)
  Fs4  = F#4  (correct)
  Gs4  = G#4  (correct)
  As4  = A#4  (correct, but fetch file named As4.mp3)
  Cs5  = C#5  (correct)

  Db4, Eb4, Gb4, Ab4, Bb4 → these will 404
```

---

## 3. Electric Bass — gleitz FluidR3_GM

**Source:** `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_bass_finger-mp3/`
**Format:** `NoteName.mp3` — FLAT notation ONLY (Bb, Db, Eb, Ab, Gb)

**Confirmed working notes:**
```
A1, Bb1, B1, C2, Db2, D2, Eb2, E2, F2, Gb2, G2, Ab2, A2, Bb2, B2, C3, Db3, D3, Eb3, E3, F3, G3, Ab3, A3, C4
```

### TUNEFRAMES_READY — Electric Bass

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  const BASS_NOTES = ['A1','Bb1','B1','C2','Db2','D2','Eb2','E2','F2','G2','Ab2','A2','Bb2','C3','D3','E3','G3','A3','C4'];
  const bassBufs = {};
  for (const note of BASS_NOTES) {
    const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_bass_finger-mp3/${note}.mp3`);
    const arr = await res.arrayBuffer();
    bassBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._bassBufs = bassBufs;

  await ctx.close();
})();
```

### Tone.Offline — Electric Bass

```javascript
// Inside Tone.Offline:
const bassUrls = {};
for (const [note, buf] of Object.entries(window._bassBufs)) {
  bassUrls[note] = new Tone.ToneAudioBuffer(buf);
}
const bass = new Tone.Sampler({ urls: bassUrls }).connect(comp);

// Sort chronologically before scheduling
const bassEvents = [
  { note: 'A2', dur: '4n', t: 0 },
  { note: 'A2', dur: '4n', t: Tone.Time('4n').toSeconds() },
  { note: 'E2', dur: '4n', t: Tone.Time('2n').toSeconds() },
  { note: 'G2', dur: '4n', t: Tone.Time('2n').toSeconds() + Tone.Time('4n').toSeconds() },
].sort((a, b) => a.t - b.t);

bassEvents.forEach(e => bass.triggerAttackRelease(e.note, e.dur, e.t));

Tone.Transport.start();
```

### Acoustic Bass variant

```javascript
// In TUNEFRAMES_READY — same note range as electric bass:
const acousticBufs = {};
for (const note of BASS_NOTES) {
  const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_bass-mp3/${note}.mp3`);
  const arr = await res.arrayBuffer();
  acousticBufs[note] = await ctx.decodeAudioData(arr);
}
window._acousticBufs = acousticBufs;

// In Tone.Offline — same Sampler wrapping pattern as electric bass
```

---

## 4. Strings — gleitz FluidR3_GM

**Source:** `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/string_ensemble_1-mp3/`
**Format:** Flat notation. Lush, pad-like orchestral strings.

**Recommended note set (covers 4 octaves):**
```
C3, D3, E3, F3, G3, A3, Bb3, B3, C4, D4, E4, F4, G4, A4, Bb4, C5, D5, E5, G5, A5, C6
```

### TUNEFRAMES_READY — Strings

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  const STRING_NOTES = ['C3','D3','E3','G3','A3','Bb3','C4','D4','E4','G4','A4','Bb4','C5','D5','E5','G5','A5','C6'];
  const strBufs = {};
  for (const note of STRING_NOTES) {
    const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/string_ensemble_1-mp3/${note}.mp3`);
    const arr = await res.arrayBuffer();
    strBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._strBufs = strBufs;

  await ctx.close();
})();
```

### Tone.Offline — Strings (sustained pad chords)

```javascript
// Inside Tone.Offline:
const strUrls = {};
for (const [note, buf] of Object.entries(window._strBufs)) {
  strUrls[note] = new Tone.ToneAudioBuffer(buf);
}
const strings = new Tone.Sampler({ urls: strUrls }).connect(comp);

// Chord pad — whole notes, sorted chronologically
const strEvents = [
  // Bar 1: C maj
  { note: 'C4', dur: '1n', t: 0 },
  { note: 'E4', dur: '1n', t: 0 },
  { note: 'G4', dur: '1n', t: 0 },
  // Bar 2: A min
  { note: 'A3', dur: '1n', t: Tone.Time('1n').toSeconds() },
  { note: 'C4', dur: '1n', t: Tone.Time('1n').toSeconds() },
  { note: 'E4', dur: '1n', t: Tone.Time('1n').toSeconds() },
].sort((a, b) => a.t - b.t);

strEvents.forEach(e => strings.triggerAttackRelease(e.note, e.dur, e.t));

Tone.Transport.start();
```

### Solo Violin and Cello variants

```javascript
// Violin — brighter timbre, higher range
const VIOLIN_NOTES = ['G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','G5','A5'];
// Cello — warmer, lower range
const CELLO_NOTES  = ['C2','D2','E2','G2','A2','C3','D3','E3','G3','A3','C4','D4','E4'];

// Fetch pattern identical to strings — swap instrument name:
// violin: `string_ensemble_1-mp3` → `violin-mp3`
// cello:  `string_ensemble_1-mp3` → `cello-mp3`
```

---

## 5. Brass — gleitz FluidR3_GM

**Source:** `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/`
**Instruments:** `trumpet-mp3`, `trombone-mp3`
**Format:** Flat notation.

**Trumpet range (confirmed):** `C3` through `C6` (typical: F3–C6)
**Trombone range:** `E1` through `F4` (typical: Bb1–F4)

### TUNEFRAMES_READY — Trumpet

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  const TRUMPET_NOTES = ['C4','D4','E4','F4','G4','A4','Bb4','C5','D5','E5','G5','A5','C6'];
  const trumpetBufs = {};
  for (const note of TRUMPET_NOTES) {
    const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/trumpet-mp3/${note}.mp3`);
    const arr = await res.arrayBuffer();
    trumpetBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._trumpetBufs = trumpetBufs;

  await ctx.close();
})();
```

### Tone.Offline — Trumpet

```javascript
// Inside Tone.Offline:
const trumpetUrls = {};
for (const [note, buf] of Object.entries(window._trumpetBufs)) {
  trumpetUrls[note] = new Tone.ToneAudioBuffer(buf);
}
const trumpet = new Tone.Sampler({ urls: trumpetUrls }).connect(comp);

const trumpetEvents = [
  { note: 'G4', dur: '4n', t: 0 },
  { note: 'A4', dur: '4n', t: Tone.Time('4n').toSeconds() },
  { note: 'C5', dur: '2n', t: Tone.Time('2n').toSeconds() },
].sort((a, b) => a.t - b.t);

trumpetEvents.forEach(e => trumpet.triggerAttackRelease(e.note, e.dur, e.t));

Tone.Transport.start();
```

### TUNEFRAMES_READY — Trombone

```javascript
// Add inside TUNEFRAMES_READY:
const TROMBONE_NOTES = ['Bb1','C2','D2','Eb2','F2','G2','Bb2','C3','D3','F3','G3','Bb3','C4','F4'];
const tromboneBufs = {};
for (const note of TROMBONE_NOTES) {
  const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/trombone-mp3/${note}.mp3`);
  const arr = await res.arrayBuffer();
  tromboneBufs[note] = await ctx.decodeAudioData(arr);
}
window._tromboneBufs = tromboneBufs;
```

---

## 6. Woodwinds — gleitz FluidR3_GM

**Instruments:** `tenor_sax-mp3`, `flute-mp3`
**Format:** Flat notation.

**Tenor Sax range:** `Ab2` – `E5` (sweet spot: Bb2–C5)
**Flute range:** `C4` – `D7` (sweet spot: D4–G6)

### TUNEFRAMES_READY — Tenor Sax

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  const SAX_NOTES = ['Bb2','C3','D3','Eb3','F3','G3','Ab3','Bb3','C4','D4','Eb4','F4','G4','Ab4','Bb4','C5'];
  const saxBufs = {};
  for (const note of SAX_NOTES) {
    const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/tenor_sax-mp3/${note}.mp3`);
    const arr = await res.arrayBuffer();
    saxBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._saxBufs = saxBufs;

  await ctx.close();
})();
```

### TUNEFRAMES_READY — Flute

```javascript
// Add inside TUNEFRAMES_READY:
const FLUTE_NOTES = ['D4','E4','F4','G4','A4','Bb4','C5','D5','E5','F5','G5','A5','C6'];
const fluteBufs = {};
for (const note of FLUTE_NOTES) {
  const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/flute-mp3/${note}.mp3`);
  const arr = await res.arrayBuffer();
  fluteBufs[note] = await ctx.decodeAudioData(arr);
}
window._fluteBufs = fluteBufs;
```

---

## 7. Guitar — gleitz FluidR3_GM

**Instruments:** `acoustic_guitar_nylon-mp3`, `electric_guitar_clean-mp3`
**Format:** Flat notation.

**Guitar range (both types):** `E2` – `D6` (standard guitar: E2–B4 open, up to D6 with high frets)

### TUNEFRAMES_READY — Nylon Guitar

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  const GUITAR_NOTES = ['E2','F2','G2','A2','Bb2','B2','C3','D3','E3','F3','G3','A3','Bb3','B3','C4','D4','E4','F4','G4','A4','Bb4','B4','C5'];
  const guitarBufs = {};
  for (const note of GUITAR_NOTES) {
    const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/${note}.mp3`);
    const arr = await res.arrayBuffer();
    guitarBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._guitarBufs = guitarBufs;

  await ctx.close();
})();
```

### Clean Electric Guitar variant

```javascript
// Same note range — swap instrument name:
// acoustic_guitar_nylon-mp3 → electric_guitar_clean-mp3
```

---

## 8. Church Organ — gleitz FluidR3_GM

**Source:** `church_organ-mp3`
**Format:** Flat notation.
**Range:** `C2` – `C7` (full keyboard range)

### TUNEFRAMES_READY — Church Organ

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  const ORGAN_NOTES = ['C2','E2','G2','C3','E3','G3','Bb3','C4','D4','E4','F4','G4','A4','Bb4','C5','E5','G5','C6'];
  const organBufs = {};
  for (const note of ORGAN_NOTES) {
    const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/church_organ-mp3/${note}.mp3`);
    const arr = await res.arrayBuffer();
    organBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._organBufs = organBufs;

  await ctx.close();
})();
```

---

## 9. Combining Multiple Instruments

### Shared AudioContext in TUNEFRAMES_READY

Open one `AudioContext`, fetch all samples, then close it. Never open multiple contexts.

```javascript
window.TUNEFRAMES_READY = (async () => {
  const ctx = new AudioContext();
  await ctx.resume();

  // -- DRUMS --
  const drumUrls = {
    kick:  'https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3',
    snare: 'https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3',
    hihat: 'https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3',
  };
  const drumBufs = {};
  for (const [name, url] of Object.entries(drumUrls)) {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    drumBufs[name] = await ctx.decodeAudioData(arr);
  }
  window._drumBufs = drumBufs;

  // -- PIANO --
  const PIANO_NOTES = ['A1','C2','Ds2','Fs2','A2','C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4','C5','Ds5','Fs5','A5','C6'];
  const pianoBufs = {};
  for (const note of PIANO_NOTES) {
    const res = await fetch(`https://tonejs.github.io/audio/salamander/${note}.mp3`);
    const arr = await res.arrayBuffer();
    pianoBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._pianoBufs = pianoBufs;

  // -- ELECTRIC BASS --
  const BASS_NOTES = ['A1','Bb1','B1','C2','Db2','D2','Eb2','E2','F2','G2','Ab2','A2','Bb2','C3','D3','E3','G3','A3','C4'];
  const bassBufs = {};
  for (const note of BASS_NOTES) {
    const res = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_bass_finger-mp3/${note}.mp3`);
    const arr = await res.arrayBuffer();
    bassBufs[note] = await ctx.decodeAudioData(arr);
  }
  window._bassBufs = bassBufs;

  await ctx.close();
})();
```

### Shared signal chain in Tone.Offline

```javascript
await Tone.Offline(async () => {
  const limiter = new Tone.Limiter(-1).toDestination();
  const comp = new Tone.Compressor(-18, 3).connect(limiter);

  // Drums
  const kick  = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.kick)).connect(comp);
  const snare = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.snare)).connect(comp);
  const hihat = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.hihat)).connect(comp);

  // Piano
  const pianoUrls = {};
  for (const [note, buf] of Object.entries(window._pianoBufs)) {
    pianoUrls[note] = new Tone.ToneAudioBuffer(buf);
  }
  const piano = new Tone.Sampler({ urls: pianoUrls }).connect(comp);

  // Bass
  const bassUrls = {};
  for (const [note, buf] of Object.entries(window._bassBufs)) {
    bassUrls[note] = new Tone.ToneAudioBuffer(buf);
  }
  const bass = new Tone.Sampler({ urls: bassUrls }).connect(comp);

  // ... schedule events sorted chronologically per instrument ...

  Tone.Transport.start();
}, durationInSeconds);
```

---

## 10. Common Mistakes and Gotchas

### Note naming errors (most common bug)

| Instrument | Wrong | Right |
|---|---|---|
| Salamander Piano | `Ab4`, `Bb4`, `Db4` | `Gs4`, `As4`, `Cs4` |
| Salamander Piano | `D#4`, `F#4` | `Ds4`, `Fs4` |
| Bass/Strings/Brass/Guitar | `As1`, `Cs2`, `Ds2` | `Bb1`, `Db2`, `Eb2` |
| Bass/Strings/Brass/Guitar | `A#1`, `C#2` | `Bb1`, `Db2` |

### AudioWorklet effects (headless crash)

```javascript
// NEVER use these — crash on headless render:
new Tone.Reverb()
new Tone.Freeverb()
new Tone.BitCrusher()
new Tone.Chebyshev()
new Tone.Phaser()    // Also AudioWorklet
new Tone.Chorus()    // Also AudioWorklet

// Safe alternatives:
new Tone.Filter()
new Tone.Gain()
new Tone.Compressor()
new Tone.Limiter()
new Tone.EQ3()
new Tone.PitchShift()  // NOT AudioWorklet
```

### Chronological scheduling (required)

```javascript
// WRONG — unsorted events cause rendering artifacts
piano.triggerAttackRelease('C4', '4n', 2.0);
piano.triggerAttackRelease('E4', '4n', 0.0);  // out of order!

// RIGHT — sort BEFORE scheduling
const events = [
  { note: 'C4', dur: '4n', t: 2.0 },
  { note: 'E4', dur: '4n', t: 0.0 },
].sort((a, b) => a.t - b.t);
events.forEach(e => piano.triggerAttackRelease(e.note, e.dur, e.t));
```

### Tone.loaded() inside Offline hangs

```javascript
// WRONG:
await Tone.Offline(async () => {
  const sampler = new Tone.Sampler({ urls: ... });
  await Tone.loaded();  // HANGS FOREVER in Offline context
  ...
}, 10);

// RIGHT — pre-fetch in TUNEFRAMES_READY, wrap buffers inside Offline:
await Tone.Offline(async () => {
  const urls = {};
  for (const [note, buf] of Object.entries(window._preloadedBufs)) {
    urls[note] = new Tone.ToneAudioBuffer(buf);
  }
  const sampler = new Tone.Sampler({ urls }).connect(comp);
  // Ready to schedule immediately — no await needed
  ...
}, 10);
```

### Drums use Player, not Sampler

```javascript
// WRONG — Sampler for drums:
const drums = new Tone.Sampler({
  urls: { C1: window._drumBufs.kick }
}).connect(comp);
drums.triggerAttackRelease('C1', '8n', t);

// RIGHT — Player per drum hit:
const kick = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.kick)).connect(comp);
Tone.Transport.schedule(time => kick.start(time), t);
```

### Single AudioContext in TUNEFRAMES_READY

```javascript
// WRONG — multiple contexts:
const ctx1 = new AudioContext();
const kickBuf = await ctx1.decodeAudioData(...);
await ctx1.close();

const ctx2 = new AudioContext();  // unnecessary
const pianoBuf = await ctx2.decodeAudioData(...);

// RIGHT — one context, close at end:
const ctx = new AudioContext();
await ctx.resume();
// ... all decodeAudioData calls ...
await ctx.close();
```

### Missing await on TUNEFRAMES_READY

```javascript
// WRONG — race condition, samples may not be loaded:
async function main() {
  await Tone.start();
  // Missing: await window.TUNEFRAMES_READY
  await Tone.Offline(async () => { ... }, 10);
}

// RIGHT:
async function main() {
  await Tone.start();
  await window.TUNEFRAMES_READY;  // wait for all samples
  await Tone.Offline(async () => { ... }, 10);
}
```

### Metadata block (required in every composition)

```html
<!-- Place in body, always present -->
<div id="tuneframes" style="display:none">{"bpm":90,"duration":"16s"}</div>
```

---

## 11. Quick Reference — All CDN URLs

| Instrument | Base URL | Notation |
|---|---|---|
| CR78 Kick | `https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3` | n/a |
| CR78 Snare | `https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3` | n/a |
| CR78 Hi-hat | `https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3` | n/a |
| Breakbeat loop | `https://tonejs.github.io/audio/drum-samples/breakbeat.mp3` | n/a |
| Salamander Piano | `https://tonejs.github.io/audio/salamander/{note}.mp3` | **Sharp 's'** (Ds4) |
| Electric Bass | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_bass_finger-mp3/{note}.mp3` | **Flat** (Bb1) |
| Acoustic Bass | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_bass-mp3/{note}.mp3` | **Flat** |
| String Ensemble | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/string_ensemble_1-mp3/{note}.mp3` | **Flat** |
| Violin | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/violin-mp3/{note}.mp3` | **Flat** |
| Cello | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/cello-mp3/{note}.mp3` | **Flat** |
| Trumpet | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/trumpet-mp3/{note}.mp3` | **Flat** |
| Trombone | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/trombone-mp3/{note}.mp3` | **Flat** |
| Tenor Sax | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/tenor_sax-mp3/{note}.mp3` | **Flat** |
| Flute | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/flute-mp3/{note}.mp3` | **Flat** |
| Nylon Guitar | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/{note}.mp3` | **Flat** |
| Clean Electric Guitar | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_guitar_clean-mp3/{note}.mp3` | **Flat** |
| Church Organ | `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/church_organ-mp3/{note}.mp3` | **Flat** |
