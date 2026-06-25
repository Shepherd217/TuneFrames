---
name: audio-boss-battle
description: Video Game Boss Battle — driving 16th-note bass ostinato, power chord stabs on offbeats, heroic AMSynth brass melody, tuned timpani hits, fast counter-arpeggio. Final Fantasy / Nobuo Uematsu epic orchestral-hybrid energy.
---

# TuneFrames — Video Game Boss Battle

## Genre Profile
- BPM range: 150–185 (intense, relentless forward drive)
- Key characteristics: Bass ostinato hammering the root in 16th notes (MonoSynth sawtooth), power chord stabs on offbeats (PolySynth square/sawtooth, short decay), heroic lead melody (AMSynth with sawtooth + sine modulation for brass-like tone), tuned timpani accents (MembraneSynth pitched to D1/A1), fast ascending counter-arpeggio for tension, driving kick pattern
- Typical instruments: MonoSynth (bass ostinato), PolySynth (power chords), AMSynth (brass melody), MembraneSynth × 2 (kick + timpani), PolySynth (counter arpeggio)
- Mood: Intense, epic, driving, heroic, desperate, high-stakes

## Core Pattern

```js
// Boss Battle — 165 BPM, D minor
// Bars 1–2: bass ostinato alone (ominous)
// Bars 3–4: power chord stabs on offbeats
// Bars 5–8: full: melody + counter arpeggio + drums

Tone.Transport.bpm.value = 165;

// Bass ostinato — driving 16th note figure around D root
const bass = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  filter: { Q: 3, type: "lowpass", rolloff: -24 },
  filterEnvelope: { attack: 0.001, decay: 0.1, sustain: 0.5, release: 0.2,
                    baseFrequency: 80, octaves: 2 },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0.7, release: 0.1 },
  volume: -4
}).toDestination();

// 16th-note ostinato: D root hammered with neighbor-note movement
const bassLine = [
  "D2","D2","F2","D2",  "G2","D2","F2","E2",
  "D2","D2","F2","D2",  "G2","F2","Eb2","D2"
];
let bassStep = 0;
new Tone.Sequence((time) => {
  bass.triggerAttackRelease(bassLine[bassStep++ % bassLine.length], "16n", time);
}, new Array(16).fill(1), "16n").start(0);

// Power chord stabs — PolySynth on the "and" of beats 1 and 3
const stabChords = [["D3","A3"],["F3","C4"],["G3","D4"],["Bb3","F4"]];
let stabStep = 0;
new Tone.Sequence((time, val) => {
  if (val) stabs.triggerAttackRelease(stabChords[stabStep++ % stabChords.length], "16n", time);
}, [null,null,1,null,null,null,null,null,null,null,1,null,null,null,null,null], "16n").start("2m");

// Heroic AMSynth melody — D minor ascending/descending
const melody = [
  { time: "4m", note: "D4", dur: "4n" }, { time: "4m:1", note: "F4", dur: "4n" },
  { time: "4m:2", note: "A4", dur: "4n" }, { time: "4m:3", note: "C5", dur: "4n" },
  { time: "5m", note: "Bb4", dur: "4n" }, { time: "5m:1", note: "A4", dur: "4n" },
  { time: "5m:2", note: "G4", dur: "2n" },
];
melody.forEach(({ time, note, dur }) => brass.triggerAttackRelease(note, dur, time));

Tone.Transport.start();
```

## Instrument Configuration

```js
// Bass ostinato — sawtooth through lowpass filter for growl
const bassVerb = new Tone.Reverb({ decay: 0.4, wet: 0.1 }).toDestination();
const bass = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  filter: { Q: 3, type: "lowpass", rolloff: -24 },
  filterEnvelope: { attack: 0.001, decay: 0.1, sustain: 0.5, release: 0.2,
                    baseFrequency: 80, octaves: 2 },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0.7, release: 0.1 },
  volume: -4
}).connect(bassVerb);

// Power chord stabs — square wave, very short decay, punchy
const stabReverb = new Tone.Reverb({ decay: 0.6, wet: 0.2 }).toDestination();
const stabs = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "square" },
  envelope: { attack: 0.001, decay: 0.12, sustain: 0.0, release: 0.08 },
  volume: -8
}).connect(stabReverb);

// AMSynth brass melody — sawtooth carrier + sine AM creates "blat" of brass
const brassVerb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).toDestination();
const brass = new Tone.AMSynth({
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.04, decay: 0.1, sustain: 0.85, release: 0.4 },
  modulation: { type: "sine" },
  modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 },
  harmonicity: 1,
  volume: -8
}).connect(brassVerb);

// Timpani — MembraneSynth pitched low, longer decay than kick
const timpsVerb = new Tone.Reverb({ decay: 1.2, wet: 0.35 }).toDestination();
const timps = new Tone.MembraneSynth({
  pitchDecay: 0.2,
  octaves: 4,
  envelope: { attack: 0.001, decay: 0.6, sustain: 0, release: 0.3 },
  volume: -4
}).connect(timpsVerb);

// Kick — driving, 8th or 16th note pattern
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.06, octaves: 8,
  envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.08 },
  volume: 0
}).toDestination();

// Counter arpeggio — fast 16th note ascent, adds tension
const arpVerb = new Tone.Reverb({ decay: 0.8, wet: 0.25 }).toDestination();
const arpSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth4" },
  envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
  volume: -14
}).connect(arpVerb);
```

## Composition Structure

- **Bars 1–2:** Bass ostinato only — ominous, low, relentless (the enemy approaches)
- **Bars 3–4:** Timpani accents on bar downbeats, power chord stabs on offbeats (tension escalates)
- **Bars 5–6:** Kick + snare enter, driving rhythm locked in, counter arpeggio begins
- **Bars 7–10:** Full arrangement — AMSynth brass melody soars over the groove
- **Bar 11–12:** Climax: all elements together, melody at highest pitch, bass most active
- **Buildup trick:** Use `Tone.Transport.bpm.linearRampTo(180, "+4m")` to gradually accelerate into the final bars

Harmonic vocabulary: D natural minor (D E F G A Bb C). Tritone sub on beat 3 (Ab) adds danger. Perfect 5th power chords [root, 5th] — no thirds — are the "8-bit" signature.

## Example Variations

### 1 — Faster bass (triplet feel, more chaotic)
```js
// 8th note triplets instead of 16ths — more chaotic, less locked-in
const tripletBass = ["D2","F2","A2","G2","F2","D2"];
let step = 0;
new Tone.Sequence((time) => {
  bass.triggerAttackRelease(tripletBass[step++ % tripletBass.length], "8t", time);
}, new Array(6).fill(1), "8t").start(0);
```

### 2 — Tempo acceleration (building to a climax)
```js
// Slowly push the BPM from 160 to 185 over 8 bars
const startTime = Tone.Time("4m").toSeconds();
Tone.Transport.bpm.setValueAtTime(160, startTime);
Tone.Transport.bpm.linearRampToValueAtTime(185, startTime + Tone.Time("4m").toSeconds());
```

### 3 — Minor key shift mid-battle (F minor for boss phase 2)
```js
// After 8 bars, shift to F minor: F G Ab Bb C Db Eb
// Retrigger stab chords and melody with new root
const phase2Chords = [["F3","C4"],["Ab3","Eb4"],["Bb3","F4"],["Db4","Ab4"]];
```
