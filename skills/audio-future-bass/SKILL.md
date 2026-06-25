---
name: audio-future-bass
description: Future Bass — wide supersaw chords (fatsawtooth PolySynth), emotional melodic lead, pitched 808 sub, trap-influenced drums, massive chorus/reverb. Flume / San Holo energy. Big, emotional, wide stereo field.
---

# TuneFrames — Future Bass

## Genre Profile
- BPM range: 140–160 (half-time groove feel, effective "heard" tempo closer to 70–80)
- Key characteristics: Supersaw chords (fatsawtooth oscillator, 5–7 unison voices, 30–50 spread), emotional minor-key melody, 808 sub bass (MembraneSynth with long pitchDecay), trap-influenced sparse kick, massive clap with reverb, hi-hat rolls with velocity variation, heavy chorus and reverb on chords
- Typical instruments: PolySynth/Synth fatsawtooth (supersaw chords), Synth/AMSynth (lead), MembraneSynth (808 + kick), NoiseSynth (clap), MetalSynth (hi-hats)
- Mood: Euphoric, emotional, uplifting, wide, festival-ready

## Core Pattern

```js
// Future Bass — 150 BPM, A minor
// Structure: intro (bars 1–2) → drop (bar 3 onward)
// Chords: Am – F – C – G (1 bar each, looping)
// 808 sub follows chord roots with pitch glide
// Half-time drums: sparse kick, big clap on beat 3

Tone.Transport.bpm.value = 150;

// Supersaw chord synth — fatsawtooth is the key ingredient
const chordVerb = new Tone.Reverb({ decay: 4, wet: 0.55 }).toDestination();
const chordChorus = new Tone.Chorus({ frequency: 0.8, delayTime: 3.5, depth: 0.8, wet: 0.7 }).connect(chordVerb);
chordChorus.start();
const chords = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "fatsawtooth", count: 5, spread: 40 },
  envelope: { attack: 0.08, decay: 0.2, sustain: 0.75, release: 2.0 },
  volume: -10
}).connect(chordChorus);

// 808 sub — MembraneSynth with long pitch glide
const sub808Dist = new Tone.Distortion({ distortion: 0.1, wet: 0.25 }).toDestination();
const sub808 = new Tone.MembraneSynth({
  pitchDecay: 0.45,   // the "808 fall" — pitch glides from note down
  octaves: 3,
  envelope: { attack: 0.001, decay: 0.85, sustain: 0, release: 0.4 }
}).connect(sub808Dist);

// Schedule supersaw chords at the drop (bar 3+)
// One-bar chord stabs with full sustain
const dropChords = [
  { time: "2m", notes: ["A2","E3","A3","C4","E4"] },   // Am
  { time: "3m", notes: ["F2","C3","F3","A3","C4"] },   // F
  { time: "4m", notes: ["C3","G3","C4","E4","G4"] },   // C
  { time: "5m", notes: ["G2","D3","G3","B3","D4"] },   // G
];
dropChords.forEach(({ time, notes }) => {
  chords.triggerAttackRelease(notes, "1m", time);
});

// 808 bass hits on chord roots — enters with drop
const subHits = [
  { time: "2m", note: "A2" }, { time: "3m", note: "F2" },
  { time: "4m", note: "C2" }, { time: "5m", note: "G2" },
];
subHits.forEach(({ time, note }) => {
  sub808.triggerAttackRelease(note, "2n", time);
});

Tone.Transport.start();
```

## Instrument Configuration

```js
// Supersaw chords — fatsawtooth + wide chorus is the defining sound
const chordVerb = new Tone.Reverb({ decay: 4.0, wet: 0.55 }).toDestination();
const chordChorus = new Tone.Chorus({ frequency: 0.8, delayTime: 3.5, depth: 0.8, wet: 0.7 });
chordChorus.connect(chordVerb);
chordChorus.start();
const chords = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "fatsawtooth", count: 5, spread: 40 },
  envelope: { attack: 0.08, decay: 0.2, sustain: 0.75, release: 2.0 },
  volume: -10
}).connect(chordChorus);

// Lead melody — bright, emotional
const leadVerb = new Tone.Reverb({ decay: 2.5, wet: 0.4 }).toDestination();
const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.3, wet: 0.25 }).connect(leadVerb);
const lead = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 1.0 },
  volume: -6
}).connect(leadDelay);

// 808 sub — long pitch decay = the glide
const sub808Dist = new Tone.Distortion({ distortion: 0.1, wet: 0.25 }).toDestination();
const sub808 = new Tone.MembraneSynth({
  pitchDecay: 0.45,
  octaves: 3,
  envelope: { attack: 0.001, decay: 0.85, sustain: 0, release: 0.4 },
  volume: 2
}).connect(sub808Dist);

// Trap kick — on beat 1 (half-time feel)
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.08, octaves: 8,
  envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 },
  volume: 0
}).toDestination();

// Clap — big noise transient with long reverb
const clapVerb = new Tone.Reverb({ decay: 2.8, wet: 0.55 }).toDestination();
const clap = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 },
  volume: -4
}).connect(clapVerb);

// Hi-hat — trap roll with velocity variation
const hat = new Tone.MetalSynth({
  frequency: 600, harmonicity: 5.1, modulationIndex: 32,
  resonance: 4500, octaves: 1.5,
  envelope: { attack: 0.001, decay: 0.03, release: 0.01 },
  volume: -12
}).toDestination();
```

## Composition Structure

- **Intro (bars 1–2):** Lead melody only with light hi-hats — emotional hook, no chords yet
- **Build (end of bar 2):** Riser noise (NoiseSynth with rising filter) creates anticipation
- **Drop (bar 3):** Supersaw chords crash in simultaneously with kick, clap, and 808 sub
- **Drop loop:** Am–F–C–G chord cycle (1 bar each), 808 follows roots, hats roll
- **Variation:** Add pitch bend on lead (modulate `lead.detune.value` ±50 cents over 1 bar)
- **Breakdown:** Mute drums, let chords ring with reverb tail — rebuild tension
- **Second drop:** Higher register chord voicing, lead octave up

Emotional tension technique: during the bar before the drop, cut all sound (or just leave a white noise riser), then everything hits at once — maximum impact.

## Example Variations

### 1 — Wider supersaw (more voices)
```js
// More unison voices = fatter, more expensive but more enormous
const chords = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "fatsawtooth", count: 7, spread: 55 },
  // ...
});
```

### 2 — Filter sweep on drop entry
```js
// Chords start filtered and open up over the first bar of the drop
const chordFilter = new Tone.Filter({ frequency: 300, type: "lowpass", Q: 2 });
// chain: chords → chordFilter → chordChorus → chordVerb
const sweepStart = Tone.Time("2m").toSeconds();
chordFilter.frequency.setValueAtTime(300, sweepStart);
chordFilter.frequency.exponentialRampToValueAtTime(12000, sweepStart + Tone.Time("1m").toSeconds());
```

### 3 — Pitched chord stab (one-hit per bar)
```js
// Instead of sustained chords, use a sharp pluck attack then let the reverb carry
const chords = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "fatsawtooth", count: 5, spread: 40 },
  envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 2.5 }, // no sustain = pluck
});
```
