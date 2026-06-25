---
name: audio-indie-pop
description: Indie Pop — jangly pluck arpeggios through chorus/reverb, warm bass, steady kick-snare-hat groove. Vampire Weekend / Tame Impala feel. Major key or Dorian, bright and infectious.
---

# TuneFrames — Indie Pop

## Genre Profile
- BPM range: 115–140
- Key characteristics: Guitar-like arpeggio lines with short pluck envelope (triangle osc, fast decay, low sustain), warm bass on root and 5th, kick on beats 1+3, snare on 2+4, steady 8th-note hi-hat, lush chorus + reverb on guitar synth
- Typical instruments: PolySynth/Synth (guitar pluck), Synth/MonoSynth (bass), MembraneSynth (kick), NoiseSynth (snare, hat)
- Mood: Bright, infectious, slightly nostalgic, melodic, danceable

## Core Pattern

```js
// Indie Pop — 128 BPM, G major
// Chord progression: G - C - Em - D (4-bar loop)
// Guitar: 8th note arpeggios with pluck envelope
// Kick: beats 1 and 3 | Snare: beats 2 and 4 | Hat: 8th notes

Tone.Transport.bpm.value = 128;

// Effects
const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
const chorus = new Tone.Chorus(3.5, 2.0, 0.6).connect(reverb);
chorus.start(); // REQUIRED — Chorus LFO must be started manually

// Guitar pluck: triangle oscillator, fast attack, short decay, minimal sustain
const guitar = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.005, decay: 0.28, sustain: 0.06, release: 0.7 },
}).connect(chorus);

// 32-note arpeggio grid (8 notes × 4 bars = G, C, Em, D)
const arpGrid = [
  "G3","B3","D4","G4","D4","B3","G3","B3",  // G major
  "C4","E4","G4","C5","G4","E4","C4","E4",  // C major
  "E3","G3","B3","E4","B3","G3","E3","G3",  // E minor
  "D3","F#3","A3","D4","A3","F#3","D3","F#3", // D major
];
let arpStep = 0;
const arpSeq = new Tone.Sequence((time) => {
  guitar.triggerAttackRelease(arpGrid[arpStep++ % arpGrid.length], "8n", time);
}, new Array(8).fill(1), "8n").start(0);

// Kick: beats 1 and 3
new Tone.Sequence((time, val) => {
  if (val) kick.triggerAttackRelease("C1", "8n", time);
}, ["C1",null,null,null,null,null,null,null,"C1",null,null,null,null,null,null,null], "16n").start(0);

// Snare: beats 2 and 4
new Tone.Sequence((time, val) => {
  if (val) snare.triggerAttackRelease("8n", time);
}, [null,null,null,null,1,null,null,null,null,null,null,null,1,null,null,null], "16n").start(0);

// Hat: 8th notes, quiet
new Tone.Sequence((time, val) => {
  if (val) hat.triggerAttackRelease("16n", time, 0.5);
}, [1,null,1,null,1,null,1,null,1,null,1,null,1,null,1,null], "16n").start(0);

Tone.Transport.start();
```

## Instrument Configuration

```js
// Guitar pluck — triangle oscillator is key (warmer than sawtooth, brighter than sine)
const guitarVerb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
const guitarChorus = new Tone.Chorus({ frequency: 3.5, delayTime: 2, depth: 0.6, wet: 0.5 }).connect(guitarVerb);
guitarChorus.start();
const guitar = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.005, decay: 0.28, sustain: 0.06, release: 0.7 },
  volume: -8
}).connect(guitarChorus);

// Bass — sine oscillator for warmth, gentle attack
const bassVerb = new Tone.Reverb({ decay: 0.6, wet: 0.1 }).toDestination();
const bass = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.4 },
  volume: -4
}).connect(bassVerb);

// Kick — less aggressive than techno, shorter pitch decay
const kickDist = new Tone.Distortion({ distortion: 0.1, wet: 0.3 }).toDestination();
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.06, octaves: 5,
  envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
  volume: -2
}).connect(kickDist);

// Snare — white noise, moderate reverb tail (less than house, more presence)
const snareVerb = new Tone.Reverb({ decay: 0.8, wet: 0.35 }).toDestination();
const snare = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
  volume: -8
}).connect(snareVerb);

// Hi-hat — highpass filtered noise, quiet
const hatFilter = new Tone.Filter(7000, "highpass").toDestination();
const hat = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
  volume: -16
}).connect(hatFilter);
```

## Composition Structure

- **Bars 1–2:** Guitar arpeggio + hi-hat only — establish the melodic hook
- **Bars 3–4:** Add kick and snare — drums lock in the groove
- **Bars 5–8:** Add bass — root + 5th pattern follows chord changes
- **Bars 9–16:** Full band, all elements — the main verse/chorus loop
- **Variation:** Add feedback delay on guitar (8th note, 25% wet) for extra spaciousness
- **Outro:** Drop drums, let guitar arpeggio ring out with reverb tail

Chord vocabulary: I–V–vi–IV in any major key (G–D–Em–C is the "axis of awesome"). Dorian mode (e.g., Am–G) adds darkness while keeping the bright groove.

## Example Variations

### 1 — Dorian Mode (darker, Am sound)
```js
// A Dorian: A B C D E F# G — common in Vampire Weekend
const arpGrid = [
  "A3","C4","E4","A4","E4","C4","A3","C4",  // Am
  "G3","B3","D4","G4","D4","B3","G3","B3",  // G major
  "D3","F#3","A3","D4","A3","F#3","D3","F#3", // D major
  "E3","G3","B3","E4","B3","G3","E3","G3",  // Em
];
```

### 2 — 16th-note arpeggio (Math rock / faster feel)
```js
// Double the arpeggio speed — 16 notes per bar instead of 8
const arpGrid = ["G3","B3","D4","G4","D4","B3","G3","B3","D4","G4","B3","D4","G4","B3","D4","G4"]; // G bar
let arpStep = 0;
new Tone.Sequence((time) => {
  guitar.triggerAttackRelease(arpGrid[arpStep++ % arpGrid.length], "16n", time);
}, new Array(16).fill(1), "16n").start(0);
```

### 3 — Add feedback delay for shimmer
```js
// Guitar → delay → chorus → reverb
const delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.28, wet: 0.22 });
// Insert: guitar.connect(delay); delay.connect(guitarChorus);
```
