---
name: audio-techno
description: Berlin-style techno — hard MembraneSynth kick, acid MonoSynth bass, industrial hi-hats, sparse stabs. Dark and mechanical.
---

# TuneFrames — Techno

## Genre Profile
- BPM range: 130–145
- Key characteristics: Hard kick on every beat, relentless forward momentum, hypnotic repetition, industrial textures, minimal melody
- Typical instruments: MembraneSynth (kick), MonoSynth (acid bass), MetalSynth or NoiseSynth (hi-hats), PolySynth (sparse stabs)
- Mood: Dark, mechanical, hypnotic, relentless

## Core Pattern

```js
// Berlin Techno — 4/4 at 136 BPM
// Kick on every beat (4-on-the-floor)
// Acid bass follows kick with filter sweep
// Hi-hats: closed on 8ths, open on off-beats
// Stabs: sparse, dissonant, 2-bar cycle

const kick = new Tone.MembraneSynth({
  pitchDecay: 0.08,
  octaves: 10,
  envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 }
}).toDestination();

// Acid bass through distortion
const dist = new Tone.Distortion(0.6).toDestination();
const bass = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  filter: { Q: 6, type: "lowpass", rolloff: -24 },
  filterEnvelope: {
    attack: 0.001, decay: 0.2, sustain: 0.3, release: 0.5,
    baseFrequency: 80, octaves: 4
  },
  envelope: { attack: 0.001, decay: 0.3, sustain: 0.4, release: 0.2 }
}).connect(dist);

// Industrial closed hi-hat
const hat = new Tone.MetalSynth({
  frequency: 400, envelope: { attack: 0.001, decay: 0.04, release: 0.01 },
  harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
}).toDestination();

// Scheduling — 1-bar loop
new Tone.Sequence((time, note) => {
  kick.triggerAttackRelease("C1", "8n", time);
}, ["C1", null, null, null, "C1", null, null, null,
    "C1", null, null, null, "C1", null, null, null], "16n").start(0);

new Tone.Sequence((time, note) => {
  if (note) hat.triggerAttackRelease("16n", time, note);
}, [0.7, 0.4, 0.7, 0.4, 0.7, 0.4, 0.9, 0.4,
    0.7, 0.4, 0.7, 0.4, 0.7, 0.5, 0.9, 0.6], "16n").start(0);

Tone.Transport.bpm.value = 136;
Tone.Transport.start();
```

## Instrument Configuration

```js
// Kick — punchy, sub-heavy membrane
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.06,
  octaves: 10,
  volume: 2,
  envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 }
}).toDestination();

// Acid bass — sawtooth through distortion + filter
const limiter = new Tone.Limiter(-3).toDestination();
const dist = new Tone.Distortion({ distortion: 0.5, wet: 0.8 }).connect(limiter);
const bass = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  filter: { Q: 8, type: "lowpass", rolloff: -24 },
  filterEnvelope: {
    attack: 0.002, decay: 0.3, sustain: 0.2, release: 0.6,
    baseFrequency: 60, octaves: 3.5
  },
  envelope: { attack: 0.001, decay: 0.2, sustain: 0.5, release: 0.3 },
  volume: -4
}).connect(dist);

// Hi-hat — metallic, tight
const hat = new Tone.MetalSynth({
  frequency: 380, harmonicity: 5.1, modulationIndex: 32,
  resonance: 4000, octaves: 1.5,
  envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
  volume: -8
}).toDestination();

// Stab — cold PolySynth, short decay
const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).toDestination();
const stab = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "square" },
  envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
  volume: -10
}).connect(reverb);
```

## Composition Structure

- **Bar 1-2:** Kick only — establish the pulse
- **Bar 3-4:** Add hi-hats — density builds
- **Bar 5-8:** Add acid bass — filter opens over 4 bars (automation)
- **Bar 9-16:** Full loop — kick + hats + bass + sparse stabs every 2 bars
- **Bar 17+:** Variation — mute elements in/out for tension/release
- **Breakdown:** Drop kick, keep hats, let bass filter sweep down — then kick re-enters hard
- **Outro:** Strip back to kick only, fade hats

Key technique: filter automation on the bass is the main expressive tool. Sweep `bass.filter.frequency` from 80Hz up to 2kHz over 8 bars, then drop back.

## Example Variations

### 1 — Stutter Kick (double kick on last 16th)
```js
// Standard 4-on-floor with double hit before the beat
const kickPattern = ["C1", null, null, null, "C1", null, null, null,
                     "C1", null, null, null, "C1", null, "C1", null];
```

### 2 — Acid Filter Sweep (automation)
```js
// Automate bass filter opening over 2 bars
const now = Tone.now();
bass.filter.frequency.setValueAtTime(80, now);
bass.filter.frequency.linearRampToValueAtTime(3000, now + 4);
bass.filter.frequency.linearRampToValueAtTime(120, now + 4.5);
```

### 3 — Ride + Open Hat Pattern
```js
// More complex hat pattern: closed-closed-open on the off
const hatVelocities = [0.8, 0.3, 0.8, 0.3, 0.8, 0.3, 1.0, 0.2,
                        0.8, 0.3, 0.8, 0.3, 0.8, 0.4, 1.0, 0.5];
// Longer decay on accented hits for "open hat" feel
```
