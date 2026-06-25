---
name: audio-lofi
description: Lo-fi Hip Hop — dusty jazzy chords, soft keys, muffled drums, chill study vibe
---

# TuneFrames — Lo-fi Hip Hop

## Genre Profile
- BPM range: 70–90
- Key characteristics: Jazz-adjacent chord progressions (Am–F–C–G or ii–V–I extensions), swung/lazy 8th-note feel, heavy reverb + slight LP filter on everything, vinyl warmth
- Typical instruments: Rhodes/electric piano (PolySynth triangle/sine), soft bass (Synth), MembraneSynth kick filtered low, closed hi-hat (MetalSynth), pad layer
- Mood: Nostalgic, cozy, introspective, study-focus

## Core Pattern

```js
// Lo-fi core: 80 BPM, Am–F–C–G, 4 chords × 2 beats each
async function main() {
  await Tone.start();
  Tone.Transport.bpm.value = 80;

  // ── Effects chain (everything runs warm and muffled) ──────────────────
  const reverb  = new Tone.Reverb({ decay: 3.5, wet: 0.55 }).toDestination();
  const lpFilter = new Tone.Filter(1800, 'lowpass').connect(reverb);
  // Optional: slight tape distortion
  const warm    = new Tone.Distortion(0.04).connect(lpFilter);

  // ── Rhodes-style chords ───────────────────────────────────────────────
  const keys = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.04, decay: 0.3, sustain: 0.7, release: 1.8 }
  }).connect(warm);
  keys.volume.value = -10;

  // ii–V–I–VI in A minor
  const chords = [
    ['A3','C4','E4'],   // Am
    ['F3','A3','C4'],   // F maj
    ['C3','E3','G3'],   // C maj
    ['G3','B3','D4'],   // G maj
  ];
  const step = Tone.Time('2n').toSeconds(); // 2 beats each chord
  chords.forEach((ch, i) => keys.triggerAttackRelease(ch, '2n', i * step));

  // ── Walking bass ──────────────────────────────────────────────────────
  const bass = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.4 }
  }).connect(lpFilter);
  bass.volume.value = -8;

  const bassNotes = ['A2', 'F2', 'C2', 'G2'];
  bassNotes.forEach((n, i) => bass.triggerAttackRelease(n, '4n', i * step));

  // ── Muffled kick (MembraneSynth + deep LP) ────────────────────────────
  const kickFilter = new Tone.Filter(200, 'lowpass').connect(reverb);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 5,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 }
  }).connect(kickFilter);
  kick.volume.value = -14;

  // Kick on beats 1 and 3 (seconds at 80 BPM: beat = 0.75s)
  const beat = 60 / 80;
  [0, beat * 2, beat * 4, beat * 6].forEach(t => kick.triggerAttackRelease('C1', '8n', t));

  // ── Soft hi-hat ───────────────────────────────────────────────────────
  const hat = new Tone.MetalSynth({
    frequency: 400, envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
    harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
  }).connect(reverb);
  hat.volume.value = -24;

  for (let i = 0; i < 8; i++) {
    hat.triggerAttackRelease('8n', i * beat * 0.5);
  }
}
```

## Instrument Configuration

```js
// Rhodes feel — triangle oscillator, slow attack, long release
const keys = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.04, decay: 0.3, sustain: 0.7, release: 1.8 }
});

// Tape warmth — very light distortion before the LP filter
const tape = new Tone.Distortion(0.04);
const lp   = new Tone.Filter(1800, 'lowpass');  // cuts harsh highs

// Lush room reverb
const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.01, wet: 0.55 });

// Chain: keys → tape → lp → reverb → destination
keys.connect(tape); tape.connect(lp); lp.connect(reverb); reverb.toDestination();

// Muffled kick — very tight low-pass (200 Hz)
const kickLp = new Tone.Filter(200, 'lowpass').toDestination();
const kick   = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 5 }).connect(kickLp);

// Airy hat — kept very quiet, short decay
const hat = new Tone.MetalSynth({ frequency: 400, envelope: { decay: 0.08 } });
hat.volume.value = -24;
hat.connect(reverb);
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
