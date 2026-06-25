---
name: audio-folk
description: Folk / Acoustic — fingerpicked guitar simulation (PolySynth pluck, alternating bass + chord tones), simple melodic line, bass root on downbeats, optional brushed snare. C/G/D major. Warm, wooden, human. Simon & Garfunkel simplicity.
---

# TuneFrames — Folk / Acoustic

## Genre Profile
- BPM range: 80–110 (comfortable walking pace)
- Key characteristics: Fingerpicking simulation via PolySynth with very fast attack, short decay, near-zero sustain (pluck envelope); thumb alternates root/5th bass notes while fingers pluck upper chord tones in between; simple diatonic melody; warm reverb, no chorus; near-dry bass; optional soft brushed snare
- Typical instruments: PolySynth/Synth (acoustic guitar pluck), Synth (bass), optional NoiseSynth (brushed snare)
- Mood: Intimate, warm, storytelling, human, wooden, unadorned

## Core Pattern

```js
// Folk fingerpicking — 92 BPM, G major
// Travis picking: thumb alternates G2/D2 (root/5th), fingers pluck upper chord tones
// Chord progression: G – C – D – Em (4-bar loop)

Tone.Transport.bpm.value = 92;

// Acoustic pluck: triangle oscillator, very short decay, no sustain
const guitarVerb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).toDestination();
const guitar = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.003, decay: 0.22, sustain: 0.0, release: 0.5 },
  volume: -6
}).connect(guitarVerb);

// Travis picking pattern for G major (8th notes, 1 bar):
// G2 (thumb-root), B3 (finger), D2 (thumb-5th), G3 (finger),
// G2 (thumb-root), D3 (finger), D2 (thumb-5th), B3 (finger)
const gBar = [
  ["0:0:0","G2"], ["0:0:2","B3"], ["0:1:0","D2"], ["0:1:2","G3"],
  ["0:2:0","G2"], ["0:2:2","D3"], ["0:3:0","D2"], ["0:3:2","B3"],
];

const cBar = [
  ["1:0:0","C2"], ["1:0:2","E3"], ["1:1:0","G2"], ["1:1:2","C3"],
  ["1:2:0","C2"], ["1:2:2","G3"], ["1:3:0","G2"], ["1:3:2","E3"],
];

const dBar = [
  ["2:0:0","D2"], ["2:0:2","F#3"], ["2:1:0","A2"], ["2:1:2","D3"],
  ["2:2:0","D2"], ["2:2:2","A3"], ["2:3:0","A2"], ["2:3:2","F#3"],
];

const emBar = [
  ["3:0:0","E2"], ["3:0:2","G3"], ["3:1:0","B2"], ["3:1:2","E3"],
  ["3:2:0","E2"], ["3:2:2","B3"], ["3:3:0","B2"], ["3:3:2","G3"],
];

const arpPart = new Tone.Part((time, note) => {
  guitar.triggerAttackRelease(note, "8n", time);
}, [...gBar, ...cBar, ...dBar, ...emBar]);
arpPart.loopEnd = "4m";
arpPart.loop = true;
arpPart.start(0);

Tone.Transport.start();
```

## Instrument Configuration

```js
// Acoustic guitar pluck — triangle oscillator, zero sustain is critical
const guitarVerb = new Tone.Reverb({ decay: 1.4, wet: 0.18 }).toDestination();
const guitar = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.003, decay: 0.22, sustain: 0.0, release: 0.5 },
  volume: -6
}).connect(guitarVerb);
// Note: sustain: 0.0 is what makes it "pluck" instead of "pad"
// Increase decay (0.3–0.5) for a slower, more resonant string feel

// Bass — sine oscillator, warm, simple root notes
const bass = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.04, decay: 0.15, sustain: 0.6, release: 0.4 },
  volume: -4
}).toDestination();

// Optional: brushed snare (very soft white noise, quiet)
const brushVerb = new Tone.Reverb({ decay: 0.6, wet: 0.3 }).toDestination();
const brushSnare = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.01, decay: 0.08, sustain: 0, release: 0.04 },
  volume: -22  // very quiet — just a whisper of rhythm
}).connect(brushVerb);

// Optional: simple melody line (same pluck synth, higher octave)
const melody = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 0.6 },
  volume: -8
}).connect(guitarVerb); // shares reverb with guitar
```

## Composition Structure

- **Bars 1–2:** Guitar fingerpicking alone — just the pattern, completely bare, let it breathe
- **Bars 3–4:** Add bass root notes on beat 1 of each bar — minimal, subtle
- **Bars 5–8:** Melody enters over the fingerpicking — simple 8th-note lines, diatonic
- **Bars 9–16:** Optional brushed snare very quietly on beats 2 and 4
- **Variation:** Pick one chord per 2 bars instead of 1 for a slower, more hymn-like feel
- **Outro:** Slow down BPM (use Transport.bpm ramp), fingerpicking thins to just root notes

Harmonic vocabulary: Stay strictly diatonic. G major scale only (G A B C D E F#). Common progressions: G–C–D–G (I–IV–V–I), G–Em–C–D (I–vi–IV–V), G–D–Em–C (the "axis" — works everywhere).

## Example Variations

### 1 — Capo feel (higher key)
```js
// Transpose all notes up a perfect 4th (G → C, like a capo at fret 5)
// G major → C major: C D E F G A B
const gBar_capo = [
  ["0:0:0","C3"], ["0:0:2","E4"], ["0:1:0","G2"], ["0:1:2","C4"],
  ["0:2:0","C3"], ["0:2:2","G3"], ["0:3:0","G2"], ["0:3:2","E4"],
];
```

### 2 — Arpeggio (no alternating bass, just chord tones ascending)
```js
// Simpler pattern: just arpeggiate each chord upward
const gArp = ["G2","B2","D3","G3","D3","B2","G2","B2"];
let step = 0;
new Tone.Sequence((time) => {
  guitar.triggerAttackRelease(gArp[step++ % gArp.length], "8n", time);
}, new Array(8).fill(1), "8n").start(0);
```

### 3 — Slower "hymn" tempo with whole-note chord pads
```js
// One chord per 2 bars at 72 BPM — more contemplative
Tone.Transport.bpm.value = 72;
pad.triggerAttackRelease(["G3","B3","D4"], "2m", "0m");
pad.triggerAttackRelease(["C3","E3","G3"], "2m", "2m");
```
