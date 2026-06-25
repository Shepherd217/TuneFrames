---
name: audio-house
description: Chicago/deep house — 4-on-the-floor kick, clap on 2 and 4, off-beat hi-hat, warm piano chord stabs, bass following the kick. Groovy and soulful.
---

# TuneFrames — House

## Genre Profile
- BPM range: 120–128
- Key characteristics: 4-on-the-floor kick, clap strictly on beats 2 and 4, off-beat open hi-hat on the "and" of every beat, warm chord stabs (7ths and 9ths), bass line locked to kick
- Typical instruments: MembraneSynth (kick), NoiseSynth (clap), MetalSynth (hi-hat), PolySynth (piano stabs), MonoSynth (bass)
- Mood: Warm, groovy, hypnotic, soulful, uplifting

## Core Pattern

```js
// Chicago House — 4/4 at 124 BPM
// Kick: every beat (1, 2, 3, 4)
// Clap: beats 2 and 4
// Hi-hat: off-beat 8th notes ("and" of each beat)
// Piano stab: 2-bar chord loop with 7th chords
// Bass: short punchy notes on kick hits + off-beat fills

const kick = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 6,
  envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
}).toDestination();

const clap = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 }
}).toDestination();

// Reverb on clap — classic house sound
const clapReverb = new Tone.Reverb({ decay: 2.5, wet: 0.55 }).toDestination();
clap.connect(clapReverb);

// 16-step kick: 4 on the floor
new Tone.Sequence((time, val) => {
  if (val) kick.triggerAttackRelease("C1", "8n", time);
}, ["C1", null, null, null, "C1", null, null, null,
    "C1", null, null, null, "C1", null, null, null], "16n").start(0);

// Clap on 2 and 4 (steps 4 and 12 in 16-step)
new Tone.Sequence((time, val) => {
  if (val) clap.triggerAttackRelease("16n", time);
}, [null, null, null, null, 1, null, null, null,
    null, null, null, null, 1, null, null, null], "16n").start(0);

// Off-beat hi-hat (every other 8th note)
new Tone.Sequence((time, val) => {
  if (val) hat.triggerAttackRelease("16n", time, 0.6);
}, [null, null, 1, null, null, null, 1, null,
    null, null, 1, null, null, null, 1, null], "16n").start(0);

Tone.Transport.bpm.value = 124;
Tone.Transport.start();
```

## Instrument Configuration

```js
// Kick — warm, slightly softer than techno
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 6,
  volume: 0,
  envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.1 }
}).toDestination();

// Clap — snappy noise with heavy reverb tail
const clapVerb = new Tone.Reverb({ decay: 2.2, wet: 0.5 }).toDestination();
const clap = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.04 },
  volume: -4
}).connect(clapVerb);

// Hi-hat — open, airy metallic
const hat = new Tone.MetalSynth({
  frequency: 300, harmonicity: 3.1, modulationIndex: 16,
  resonance: 3500, octaves: 1.2,
  envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
  volume: -10
}).toDestination();

// Piano stab — warm PolySynth, major 7ths
const stabChorus = new Tone.Chorus({ frequency: 3, depth: 0.4, wet: 0.3 }).toDestination();
const stabVerb = new Tone.Reverb({ decay: 1.8, wet: 0.25 }).connect(stabChorus);
const piano = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.6 },
  volume: -8
}).connect(stabVerb);

// Bass — punchy MonoSynth, follows kick
const bass = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  filter: { Q: 2, type: "lowpass", frequency: 600 },
  filterEnvelope: { attack: 0.001, decay: 0.15, sustain: 0.1, release: 0.2,
                    baseFrequency: 100, octaves: 2 },
  envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.15 },
  volume: -4
}).toDestination();
```

## Composition Structure

- **Bar 1-2:** Kick + hi-hat only — establish 4-on-floor groove
- **Bar 3-4:** Add clap on 2 and 4 — full drum feel
- **Bar 5-8:** Add bass — follows kick with short punchy notes
- **Bar 9-16:** Add piano stabs — 2-bar chord loop, minor 7ths or major 9ths
- **Bar 17-24:** Full groove — all elements, maybe add a secondary hi-hat accent
- **Breakdown (bar 25-32):** Drop kick and bass, keep hats + piano — build tension
- **Drop:** Kick returns hard — full energy re-entry
- **Outro:** Hi-hat fades, bass drops out, kick last

Chord vocabulary (deep house): Fm7 (F-Ab-C-Eb), Bbm9, Ebmaj7, Dbmaj7. Use minor 7ths for darkness, major 7ths for warmth.

## Example Variations

### 1 — Swung 16ths (shuffle feel)
```js
// Apply shuffle to the Transport for a more "human" groove
Tone.Transport.swing = 0.15;
Tone.Transport.swingSubdivision = "16n";
```

### 2 — Rolling Bass (octave fills between kicks)
```js
// Bass hits on kick + fills in the gaps with octave jumps
const bassPattern = [
  { note: "A1", dur: "8n" }, { note: null },
  { note: "A2", dur: "16n" }, { note: null }, // octave fill
  { note: "A1", dur: "8n" }, { note: null },
  { note: "A1", dur: "16n" }, { note: "G1", dur: "16n" } // chromatic approach
];
```

### 3 — Piano Chord Stab Rhythm Variation
```js
// Syncopated stab — off the beat for groove
// Hit on the "and" of beat 2 and beat 4
const stabSteps = [null, null, null, null, null, 1, null, null,
                   null, null, null, null, null, 1, null, null];
```
