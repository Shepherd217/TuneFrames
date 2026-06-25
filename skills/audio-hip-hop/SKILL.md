---
name: audio-hip-hop
description: Boom Bap Hip Hop — punchy kick, snare on 2 and 4 with reverb tail, shuffled 16th hi-hats with swing, smooth bass line, warm soul-pad. Pete Rock / J Dilla / Madlib head-nod groove.
---

# TuneFrames — Boom Bap Hip Hop

## Genre Profile
- BPM range: 80–95 (slow enough to feel heavy)
- Key characteristics: Heavy kick with short distortion (MembraneSynth), snare strictly on beats 2 and 4 with long reverb tail, 16th-note hi-hats with Tone.Transport swing (0.4–0.6) for the shuffle, smooth chromatic bass line, warm pad chord with slow attack for "sampled soul" texture
- Typical instruments: MembraneSynth (kick), NoiseSynth (snare), MetalSynth or NoiseSynth (hat), MonoSynth or Synth (bass), PolySynth (pad)
- Mood: Head-nodding, soulful, heavy, hypnotic, dusty

## Core Pattern

```js
// Boom Bap — 88 BPM, F minor, 2-bar loop
// Swing makes this: 16th hat offbeats push back into shuffle territory
// Kick: beat 1 + syncopated ghost hit | Snare: beats 2 and 4 | Hat: 16ths shuffled

Tone.Transport.bpm.value = 88;
Tone.Transport.swing = 0.5;           // full swing — offbeat 16ths pushed back
Tone.Transport.swingSubdivision = "16n";

// Kick: beat 1, "and" of beat 2, beat 3 (classic boom bap syncopation)
new Tone.Sequence((time, val) => {
  if (val) kick.triggerAttackRelease("C1", "8n", time);
}, ["C1",null,null,null,null,null,"C1",null,"C1",null,null,null,null,null,null,null], "16n").start(0);
//   beat1              and-of-2             beat3

// Snare: strictly 2 and 4
new Tone.Sequence((time, val) => {
  if (val) snare.triggerAttackRelease("8n", time);
}, [null,null,null,null,1,null,null,null,null,null,null,null,1,null,null,null], "16n").start(0);

// Hi-hat: all 16ths with alternating velocity — swing does the shuffle work
const hatVels = [0.9,0.45,0.85,0.4,0.9,0.45,0.85,0.4,0.9,0.45,0.9,0.4,0.85,0.45,0.9,0.45];
let hatStep = 0;
new Tone.Sequence((time) => {
  hat.triggerAttackRelease("16n", time, hatVels[hatStep++ % 16]);
}, new Array(16).fill(1), "16n").start(0);

Tone.Transport.start();
```

## Instrument Configuration

```js
// Kick — MembraneSynth with slight saturation (the "punchy" sound)
const kickDist = new Tone.Distortion({ distortion: 0.2, wet: 0.4 }).toDestination();
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.07,
  octaves: 6,
  envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.1 },
  volume: 0
}).connect(kickDist);

// Snare — white noise with a long reverb tail (the "room" sound)
const snareVerb = new Tone.Reverb({ decay: 1.8, wet: 0.5 }).toDestination();
const snare = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.06 },
  volume: -4
}).connect(snareVerb);

// Hi-hat — crisp, short, metallic
const hat = new Tone.MetalSynth({
  frequency: 500,
  envelope: { attack: 0.001, decay: 0.04, release: 0.01 },
  harmonicity: 5.1,
  modulationIndex: 24,
  resonance: 4000,
  octaves: 1.2,
  volume: -12
}).toDestination();

// Bass — MonoSynth, smooth but defined
const bass = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  filter: { Q: 2, type: "lowpass", rolloff: -12 },
  filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3,
                    baseFrequency: 120, octaves: 1.5 },
  envelope: { attack: 0.01, decay: 0.15, sustain: 0.7, release: 0.3 },
  volume: -4
}).toDestination();

// Soul pad — warm PolySynth, slow attack = "reverse sample" texture
const padVerb = new Tone.Reverb({ decay: 3.5, wet: 0.5 }).toDestination();
const pad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.6, decay: 0.5, sustain: 0.7, release: 2.0 },
  volume: -14
}).connect(padVerb);
```

## Composition Structure

- **Bar 1:** Kick + snare + hat only — establish the swung groove, feel the shuffle
- **Bars 2–4:** Add bass — smooth line following Fm → Cm → Bb → Eb
- **Bars 5–8:** Add soul pad — Fm7 chord with slow attack, warm
- **Bars 9–16:** Full groove — all elements, occasionally double the kick for variation
- **Half-time bar:** Every 4–8 bars, simplify to kick on beat 1 only — creates space then snaps back

Dilla technique: vary the kick pattern slightly each 2 bars instead of looping the exact same hit positions. Use a step counter to swap between two kick pattern arrays.

## Example Variations

### 1 — "Dilla" floating kick (pattern alternates every 2 bars)
```js
const kickPatterns = [
  ["C1",null,null,null,null,null,"C1",null,"C1",null,null,null,null,null,null,null],
  ["C1",null,null,null,null,null,null,null,"C1",null,"C1",null,null,null,null,null],
];
let bar = 0;
new Tone.Sequence((time, val) => {
  if (val) kick.triggerAttackRelease("C1", "8n", time);
}, kickPatterns[Math.floor(bar++ / 16) % 2], "16n").start(0);
```

### 2 — Swing amount variation (lighter shuffle)
```js
// 0.3 = light shuffle (more "straight"), 0.5 = full triplet swing, 0.15 = barely swung
Tone.Transport.swing = 0.35; // Pete Rock feel — noticeable but not extreme
```

### 3 — Open hi-hat accent on beat 4
```js
// Add an open hi-hat (longer decay) on step 12 for groove
const openHat = new Tone.MetalSynth({ ...hat options..., envelope: { decay: 0.18 } }).toDestination();
const openHatSeq = new Tone.Sequence((time, val) => {
  if (val) openHat.triggerAttackRelease("8n", time, 0.7);
}, [null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null], "16n").start(0);
```
