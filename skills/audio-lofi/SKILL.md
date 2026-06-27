---
name: audio-lofi
description: Lo-fi Hip Hop — dusty jazzy chords, soft keys, muffled drums, chill study vibe
---

# TuneFrames — Lo-fi Hip Hop

## Genre Profile
- BPM range: 70–90
- Key characteristics: Jazz-adjacent chord progressions (Am–F–C–G or ii–V–I extensions), swung/lazy 8th-note feel, heavy reverb + slight LP filter on everything, vinyl warmth
- Typical instruments: Salamander Grand piano (Tone.Sampler via tonejs.github.io CDN), electric fingered bass (Tone.Sampler via gleitz FluidR3_GM CDN), CR78 kick/snare/hihat one-shots (Tone.Player via tonejs.github.io CDN), vinyl pink noise (Tone.Noise)
- Mood: Nostalgic, cozy, introspective, study-focus
- Sample sources: real CDN audio — requires `window.TUNEFRAMES_READY` pre-fetch pattern (see example.html)

## Core Pattern

Real CDN samples require the `window.TUNEFRAMES_READY` pre-fetch pattern — see example.html for the full working implementation. Abbreviated structure:

```js
// BEFORE main(): pre-fetch all CDN samples into window globals
window.TUNEFRAMES_READY = (async () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  await ctx.resume();
  // fetch Salamander piano, gleitz electric bass, CR78 drums → store as AudioBuffers
  // ...see example.html for complete fetch/decode block...
  await ctx.close();
})();

// Lo-fi core: 80 BPM, Am7–Fmaj7–Cmaj7–G7, 4 chords × 2 beats each
async function main() {
  await Tone.start();
  await window.TUNEFRAMES_READY; // safety gate — already resolved when Offline runs

  Tone.Transport.bpm.value = 80;

  // ── Effects chain (everything runs warm and muffled) ──────────────────
  const reverb   = new Tone.Reverb({ decay: 3.5, wet: 0.55 }).toDestination();
  await reverb.ready;
  const lpFilter = new Tone.Filter(1800, 'lowpass').connect(reverb);
  const warm     = new Tone.Distortion(0.04).connect(lpFilter);

  // ── Salamander piano (Tone.Sampler) ───────────────────────────────────
  const pianoUrls = {};
  for (const [note, buf] of Object.entries(window._pianoBufs || {})) {
    pianoUrls[note] = new Tone.ToneAudioBuffer(buf);
  }
  const keys = new Tone.Sampler({ urls: pianoUrls, attack: 0.05, release: 2.0 }).connect(warm);
  keys.volume.value = -10;

  // Am7–Fmaj7–Cmaj7–G7
  const step = Tone.Time('2n').toSeconds();
  const chords = [
    ['A3','C4','E4','G4'], ['F3','A3','C4','E4'],
    ['C3','E3','G3','B3'], ['G3','B3','D4','F4'],
  ];
  // Sort all events chronologically before scheduling
  const events = [];
  chords.forEach((ch, i) => events.push({ ch, t: i * step }));
  events.sort((a, b) => a.t - b.t);
  events.forEach(({ ch, t }) => keys.triggerAttackRelease(ch, '2n', t));

  // ── Electric fingered bass (Tone.Sampler) ─────────────────────────────
  const bassUrls = {};
  for (const [note, buf] of Object.entries(window._bassBufs || {})) {
    bassUrls[note] = new Tone.ToneAudioBuffer(buf);
  }
  const bassFilter = new Tone.Filter(600, 'lowpass').connect(reverb);
  const bass = new Tone.Sampler({ urls: bassUrls, attack: 0.02, release: 0.5 }).connect(bassFilter);
  bass.volume.value = -6;

  // ── CR78 drums (Tone.Player — use Tone.Transport.schedule) ────────────
  const kickLp = new Tone.Filter(200, 'lowpass').connect(reverb);
  const kick   = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.kick)).connect(kickLp);
  kick.volume.value = -14;

  const beat = 60 / 80; // 0.75s
  // Sort times chronologically before scheduling
  const kickTimes = [0, beat*2, beat*4, beat*6].sort((a, b) => a - b);
  kickTimes.forEach(t => Tone.Transport.schedule(time => kick.start(time), t));
  // (Transport auto-starts after main() — events fire at the scheduled offsets)
}
```

## Instrument Configuration

```js
// Salamander Grand — slight fade in/out mimics Rhodes key dynamics
const keys = new Tone.Sampler({ urls: pianoUrls, attack: 0.05, release: 2.0 });

// Tape warmth — very light distortion before the LP filter
const tape   = new Tone.Distortion(0.04);
const lp     = new Tone.Filter(1800, 'lowpass');  // cuts harsh highs
const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.01, wet: 0.55 });

// Chain: keys → tape → lp → reverb → destination
keys.connect(tape); tape.connect(lp); lp.connect(reverb); reverb.toDestination();

// Electric fingered bass — LP keeps it warm and round
const bassFilter = new Tone.Filter(600, 'lowpass').connect(reverb);
const bass = new Tone.Sampler({ urls: bassUrls, attack: 0.02, release: 0.5 }).connect(bassFilter);

// CR78 kick — muffled below 200 Hz for that dusty thump
const kickLp = new Tone.Filter(200, 'lowpass').connect(reverb);
const kick   = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.kick)).connect(kickLp);

// CR78 snare — bandpass at 3 kHz for snap without harsh transients
const snareFlt = new Tone.Filter(3000, 'bandpass').connect(reverb);
const snare    = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.snare)).connect(snareFlt);

// CR78 hi-hat — quiet, goes straight into the room reverb
const hat = new Tone.Player(new Tone.ToneAudioBuffer(window._drumBufs.hihat)).connect(reverb);
hat.volume.value = -28;
```

## Composition Structure

1. **Intro (0–2s):** Keys enter alone with chord 1, bass follows on beat 2
2. **Main loop (2–8s):** Full Am–F–C–G cycle, kick on 1+3, hat 8ths, bass walks roots
3. **Variation (8–10s):** Add a simple melody fragment (C5–E5–G5–A5) over the progression
4. **Outro:** Let chords ring out with long release, hat fades (volume ramp)

## Example Variations

### 1 — Jazzier chord voicings (7ths)
```js
const chords = [
  ['A3','C4','E4','G4'],  // Am7
  ['F3','A3','C4','E4'],  // Fmaj7
  ['C3','E3','G3','B3'],  // Cmaj7
  ['G3','B3','D4','F4'],  // G7
];
```

### 2 — Slower, dreamier (70 BPM + delay)
```js
Tone.Transport.bpm.value = 70;
const delay = new Tone.FeedbackDelay('8n.', 0.3).connect(reverb);
keys.connect(delay); // dotted-8th echo
```

### 3 — Add a simple vinyl-crackle effect (noise burst)
```js
const noise = new Tone.Noise('pink').connect(new Tone.Filter(600, 'lowpass').toDestination());
noise.volume.value = -40;
noise.start(0).stop('+10');
```
