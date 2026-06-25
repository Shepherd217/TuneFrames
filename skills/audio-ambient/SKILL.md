---
name: audio-ambient
description: Brian Eno-style ambient — long evolving drone pads, massive reverb (8-12s decay), no percussion, slow pitch movement
---

# TuneFrames — Ambient

## Genre Profile
- BPM range: 50-70 (or unmeasured — BPM matters only for note scheduling)
- Key characteristics: slow fade-ins/outs (attack 3-6s, release 5-8s), pitch movement by semitones over 4-8 seconds, overlapping sustain layers, no rhythm
- Typical instruments: PolySynth (sine/triangle), soft AM pads, FMSynth with gentle modulation
- Mood: deep, meditative, timeless, oceanic

## Core Pattern

```js
// Ambient: overlapping long pads that evolve slowly
// Key = D minor — dark and peaceful
// Chord tones: D2, F2, A2, C3, E3, G3

const reverb = new Tone.Reverb({ decay: 10, wet: 0.9 });
await reverb.generate(); // must await before using
reverb.toDestination();

const delay = new Tone.FeedbackDelay({ delayTime: '4n', feedback: 0.4, wet: 0.3 });
delay.connect(reverb);

// Primary drone pad — slow attack, very long sustain
const drone = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 4.0, decay: 2.0, sustain: 0.9, release: 6.0 },
  volume: -10,
});
drone.connect(delay);

// Shimmer layer — high harmonics, triangle wave
const shimmer = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 5.0, decay: 1.5, sustain: 0.7, release: 7.0 },
  volume: -18,
});
shimmer.connect(reverb);

// Schedule evolving chord tones — no rhythm, just slow fades in/out
const notes = ['D2', 'A2', 'F3', 'C3', 'E3', 'D3', 'G2'];
notes.forEach((note, i) => {
  const offset = i * 2.5; // stagger each note by 2.5 seconds
  Tone.Transport.scheduleOnce((time) => {
    drone.triggerAttackRelease(note, '8n', time); // long hold
  }, offset);
});

// Shimmer tones — offset so they breathe between drone attacks
['F4', 'A4', 'C5', 'E5'].forEach((note, i) => {
  Tone.Transport.scheduleOnce((time) => {
    shimmer.triggerAttackRelease(note, '8n', time);
  }, i * 3.2 + 1.5);
});

Tone.Transport.bpm.value = 60;
Tone.Transport.start();
```

## Instrument Configuration

```js
// Massive reverb — the defining character of ambient
const reverb = new Tone.Reverb({ decay: 10, preDelay: 0.05, wet: 0.88 });
await reverb.generate(); // always await!

// Sidechain delay for shimmer depth
const delay = new Tone.FeedbackDelay({ delayTime: 0.375, feedback: 0.45, wet: 0.35 });

// Primary drone — sine waves, extremely slow envelope
const drone = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 4.5, decay: 2.0, sustain: 0.85, release: 7.0 },
  volume: -8,
});

// Overtone layer — triangle adds warmth without brightness
const overtone = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 3.0, decay: 1.5, sustain: 0.7, release: 5.0 },
  volume: -16,
});

// Sub drone — sine one octave below, anchors the space
const sub = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 6.0, decay: 3.0, sustain: 0.9, release: 8.0 },
  volume: -14,
});

// Signal chain: instruments → delay → reverb → destination
drone.connect(delay);
overtone.connect(reverb);
sub.connect(reverb);
delay.connect(reverb);
```

## Composition Structure

**Ambient has no traditional structure — it breathes.**

1. **Entry (0-4s):** First note fades in almost imperceptibly — attack is 4+ seconds
2. **Accumulation (4-10s):** Second and third pitches enter, staggered 2-4s apart, building a slow chord cloud
3. **Shimmer (8-14s):** Upper register tones enter — overtones of the root
4. **Sustained body (10-20s+):** All layers overlap. Nothing resolves — everything just exists together
5. **No outro needed** — ambient fades naturally because of long release envelopes

**Pitch movement rules:**
- Move by semitones or whole steps only — no jumps larger than a 4th
- Let dissonance exist — it resolves by itself over time
- Never use more than 4-5 notes simultaneously

## Example Variations

### Variation 1: Major / peaceful
```js
// C major drone — open and spacious
const chordNotes = ['C3', 'G3', 'E4', 'B3', 'D4'];
// Brighter attack on shimmer: attack: 2.5
// Higher reverb wet: 0.92
```

### Variation 2: Cluster / tension
```js
// Half-step cluster — creates gentle tension that never resolves
const tones = ['E3', 'F3', 'G3', 'Ab3']; // chromatic compression
// Slower attack: 6.0 — the dissonance appears gradually so it never feels harsh
// Delay feedback higher: 0.55 — creates wash of overtones
```

### Variation 3: Single-note breath
```js
// Pure minimalism — one pitch at a time, long silences between
const seq = ['D3', null, null, null, 'F3', null, null, null, 'A3'];
// This is the most meditative form — inspired by Feldman/Satie
// Set reverb decay to 12s so notes bleed into silence
```
