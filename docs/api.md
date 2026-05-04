---
title: API Reference
description: Tone.js instruments, effects, and patterns for TuneFrames compositions.
---

# API Reference

## Metadata Block

Every composition needs a metadata block:

```html
<div id="tuneframes" style="display:none">{"bpm":120,"duration":"4s"}</div>
```

- **bpm** — beats per minute (default: 120)
- **duration** — render length in **seconds**. Use `"4s"`, `"10s"`, not `"4n"`.

> **Duration warning:** `"4n"` means "4 quarter notes = 1 whole note" (2 seconds at 120 BPM). It is NOT "4 beats." Always use seconds in the metadata block.

## The `main()` Function

```js
async function main() {
  await Tone.start(); // required — initializes audio context
  // ... schedule your notes
}
```

## Instruments

### Synth — basic tone generation

```js
const synth = new Tone.Synth().toDestination();
synth.triggerAttackRelease('C4', '4n', 0);
```

### MonoSynth — single-voice with filter, good for bass and lead

```js
const mono = new Tone.MonoSynth({
  oscillator: { type: 'sawtooth' },
  filter: { Q: 3, type: 'lowpass', rolloff: -24 },
  envelope: { attack: 0.005, decay: 0.15, sustain: 0.5, release: 0.1 }
}).toDestination();
```

### PolySynth — multiple voices, for chords and pads

```js
const pad = new Tone.PolySynth(Tone.Synth).toDestination();
pad.triggerAttackRelease(['C4', 'E4', 'G4'], '1n', 0); // C major chord
```

### MembraneSynth — kick drums, toms

```js
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.05, octaves: 6,
  oscillator: { type: 'sine' },
  envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
}).toDestination();
kick.triggerAttackRelease('C1', '4n', 0);
```

### NoiseSynth — hi-hats, snares, texture

```js
const hihat = new Tone.NoiseSynth({
  noise: { type: 'white' },
  envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.01 }
}).toDestination();
hihat.volume.value = -10; // lower volume
hihat.triggerAttackRelease('16n', 0);
```

### MetalSynth — cymbals, shakers, metallic percussion

```js
const cymbal = new Tone.MetalSynth({
  frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, resonance: 3000, modulationIndex: 10
}).toDestination();
```

## Effects

```js
const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
const delay = new Tone.FeedbackDelay('8n', 0.4).toDestination();
const comp = new Tone.Compressor(-12, 2).toDestination();
const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
const phaser = new Tone.Phaser({
  frequency: 0.5, octaves: 3, baseFrequency: 1000
}).toDestination();
```

Connect an effect before `toDestination()` to route audio through it:

```js
const synth = new Tone.Synth().connect(reverb).toDestination();
```

## Scheduling Notes

### By beat position

```js
const beat = Tone.Time('4n').toSeconds();
synth.triggerAttackRelease('C4', '4n', 0);        // beat 1
synth.triggerAttackRelease('E4', '4n', beat);      // beat 2
synth.triggerAttackRelease('G4', '4n', beat * 2);  // beat 3
synth.triggerAttackRelease('C5', '4n', beat * 3);  // beat 4
```

### Loops (for drum patterns)

```js
const beat = Tone.Time('4n').toSeconds();

// Kick on every beat
for (let i = 0; i < 4; i++) {
  kick.triggerAttackRelease('C1', '4n', i * beat);
}

// Snare on 2 and 4
[1, 3].forEach(i => snare.triggerAttackRelease('C3', '4n', i * beat));

// Hi-hat on every 8th note
for (let i = 0; i < 8; i++) {
  hihat.triggerAttackRelease('16n', i * beat * 0.5);
}
```

### Chord progressions

```js
const progression = [
  ['D3', 'F3', 'A3'],  // Dm
  ['C3', 'E3', 'G3'],  // C
  ['Bb2', 'D3', 'F3'], // Bb
  ['A2', 'C3', 'E3'],  // Am
];
const measure = Tone.Time('1n').toSeconds();
progression.forEach((chord, i) => {
  pad.triggerAttackRelease(chord, '1n', i * measure);
});
```

## Signal Flow

```
Instrument → Effect chain → Destination

synth → reverb → delay → comp → destination
```

Effects must be connected between the instrument and `toDestination()` to process its audio.