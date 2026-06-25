---
name: audio-trap
description: Trap — 808 sub bass with pitch bend, snare on 2 and 4, rapid hi-hat rolls with velocity variation, sparse orchestral strings for drama.
---

# TuneFrames — Trap

## Genre Profile
- BPM range: 130–160 (half-time feel makes it sit like 65–80)
- Key characteristics: 808 sub bass with long decay and downward pitch bend, snare on beats 2 and 4, hi-hat rolls in 16th/32nd triplets with strong velocity variation, heavy low end, atmospheric elements
- Typical instruments: MembraneSynth (808 sub), NoiseSynth (snare), MetalSynth (hi-hats), PolySynth (strings/pads)
- Mood: Menacing, cinematic, heavy, dramatic

## Core Pattern

```js
// Trap — 140 BPM, half-time feel
// 808: long decay sub with downward pitch glide
// Snare: beat 2 and 4 (half-time = bars 1 and 3)
// Hi-hats: rapid rolls, velocity builds and drops — the signature
// Strings: sparse atmospheric chords

// 808 sub — MembraneSynth with pitch envelope = signature glide
const sub = new Tone.MembraneSynth({
  pitchDecay: 0.5,       // long pitch glide (the "808 fall")
  octaves: 3,            // moderate pitch drop
  envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 0.5 }
}).toDestination();

// Trigger 808 on beat 1 — pitch starts at C2 then falls
sub.triggerAttackRelease("C2", "2n", time);

// Hi-hat roll — 32nd notes, velocity variation = the trap signature
const hatVelocities = [
  0.9, 0.3, 0.5, 0.2, 0.7, 0.2, 0.4, 0.2,  // 8-step build
  0.6, 0.3, 0.8, 0.2, 0.5, 0.3, 1.0, 0.2   // accent on last
];
new Tone.Sequence((time, vel) => {
  hat.triggerAttackRelease("32n", time, vel);
}, hatVelocities, "32n").start(0);
```

## Instrument Configuration

```js
// 808 Sub — long pitchDecay is the defining characteristic
const dist808 = new Tone.Distortion({ distortion: 0.15, wet: 0.3 }).toDestination();
const sub = new Tone.MembraneSynth({
  pitchDecay: 0.45,    // how long the pitch "falls" — the 808 glide
  octaves: 3,          // semitones of pitch drop
  volume: 2,
  envelope: { attack: 0.001, decay: 1.0, sustain: 0, release: 0.6 }
}).connect(dist808);   // light saturation adds warmth to the sub

// Snare — tight white noise, minimal reverb
const snareVerb = new Tone.Reverb({ decay: 0.8, wet: 0.2 }).toDestination();
const snare = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.06 },
  volume: -2
}).connect(snareVerb);

// Hi-hat — very short decay, high frequency
const hat = new Tone.MetalSynth({
  frequency: 800,
  envelope: { attack: 0.001, decay: 0.03, release: 0.008 },
  harmonicity: 5.1,
  modulationIndex: 32,
  resonance: 5000,
  octaves: 2,
  volume: -8
}).toDestination();

// Orchestral strings — sparse, atmospheric
const stringsVerb = new Tone.Reverb({ decay: 4.0, wet: 0.6 }).toDestination();
const strings = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth4" },
  envelope: { attack: 0.4, decay: 1.0, sustain: 0.7, release: 1.5 },
  volume: -12
}).connect(stringsVerb);
```

## Composition Structure

- **Bar 1:** 808 hit on beat 1, snare on beat 3 (half-time), hi-hat roll building
- **Bar 2:** 808 on beat 1 again (the sub is still decaying from bar 1), hi-hat variation
- **Bars 1-4:** Drum loop establishes half-time feel with rolls escalating
- **Bar 5-8:** Add strings — sparse pad chord, lots of reverb
- **Bar 9-16:** Full arrangement — 808 pattern + hi-hat rolls + strings harmony
- **Build:** Hi-hat velocity increases toward drop, 32nd note flurry
- **Drop:** 808 hits hard, hi-hats sparse, strings cut — maximum impact

Hi-hat roll anatomy: Start sparse (quarter notes), build to 8ths, then 16ths, then 32nds on the approach to the drop. This escalation is the genre's primary tension tool.

## Example Variations

### 1 — Classic 808 Double Hit
```js
// 808 hits twice in a bar — beat 1 and the "and" of beat 3
const subPattern = ["C2", null, null, null, null, null, "C1", null];
// Second hit is higher (C1 vs C2) — common trap technique
```

### 2 — Hi-Hat Triplet Roll
```js
// Triplet 16ths (12 per bar instead of 16) — more organic feel
new Tone.Sequence((time, vel) => {
  if (vel) hat.triggerAttackRelease("32n", time, vel);
}, [0.9, 0.3, 0.6, 0.9, 0.3, 0.6, 0.9, 0.3, 0.6, 0.9, 0.3, 0.9], "8t").start(0);
```

### 3 — Sliding 808 Pitch (Tone.js portamento)
```js
// Use portamento on MonoSynth for more dramatic pitch slide
const slideSub = new Tone.MonoSynth({
  oscillator: { type: "sine" },
  portamento: 0.4,    // glide time in seconds
  envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 0.5 },
  filter: { type: "lowpass", frequency: 200 }
});
slideSub.triggerAttackRelease("C3", "2n", time);
// Then after portamento, note has already slid down
```
