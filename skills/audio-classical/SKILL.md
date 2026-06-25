---
name: audio-classical
description: Classical solo piano — left hand Alberti bass or broken chords, right hand melody with ornaments, no effects beyond room reverb
---

# TuneFrames — Classical Piano

## Genre Profile
- BPM range: 80-140 (Allegro for Mozart, Andante for slow movements)
- Key characteristics: Alberti bass in left hand (bass-chord-chord pattern), melodic right hand in single notes or octaves, voice leading between the two hands, harmonic rhythm changes every half or full bar
- Typical instruments: Tone.Synth with triangle oscillator (cleanest piano approximation), slight room reverb only
- Mood: elegant, structured, emotionally direct, intellectually clear

## Core Pattern

```js
// Classical piano: right hand melody over left hand Alberti bass
// Key = C major, BPM = 104 (Allegro moderato)
// Alberti bass = bass note → inner chord → upper chord, repeating 8th notes
Tone.Transport.bpm.value = 104;

// Piano synth — triangle wave with tight envelope
const piano = new Tone.Synth({
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.008, decay: 0.3, sustain: 0.2, release: 1.2 },
  volume: -6,
});

// Gentle room reverb only
const reverb = new Tone.Reverb({ decay: 1.2, preDelay: 0.01, wet: 0.25 });
await reverb.generate();
reverb.toDestination();
piano.connect(reverb);

// A second instance for left hand (allows simultaneous notes)
const pianoL = new Tone.Synth({
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.008, decay: 0.4, sustain: 0.15, release: 1.0 },
  volume: -10, // left hand slightly quieter
});
pianoL.connect(reverb);

// RIGHT HAND: C major scale as 8th-note melody (C D E F G F E D)
const rhNotes = ['C5','D5','E5','F5','G5','F5','E5','D5'];
const rhTimes = [0, 0.29, 0.57, 0.86, 1.15, 1.44, 1.73, 2.02]; // 8th notes at 104 BPM
rhNotes.forEach((note, i) => {
  Tone.Transport.scheduleOnce(time => {
    piano.triggerAttackRelease(note, '8n', time);
  }, rhTimes[i]);
});

// LEFT HAND: Alberti bass on C major chord (C3 → E3 → G3 repeating)
// Pattern: C3, G3, E3, G3 (bass → upper → inner → upper)
const lhPattern = ['C3','G3','E3','G3', 'F2','A2','F2','A2'];
lhPattern.forEach((note, i) => {
  Tone.Transport.scheduleOnce(time => {
    pianoL.triggerAttackRelease(note, '8n', time);
  }, i * 0.29); // 8th note spacing at 104 BPM
});
```

## Instrument Configuration

```js
// Piano approximation — triangle + tight decay, slight room
// Two instances: right hand (melody) and left hand (accompaniment)

// Room reverb — small, not a concert hall
const reverb = new Tone.Reverb({ decay: 1.1, preDelay: 0.008, wet: 0.22 });
await reverb.generate();
reverb.toDestination();

// Right hand — melody voice, slightly brighter
const rh = new Tone.Synth({
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.006, decay: 0.25, sustain: 0.15, release: 1.4 },
  volume: -4,
}).connect(reverb);

// Left hand — accompaniment, slightly softer and darker
const lh = new Tone.Synth({
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 1.0 },
  volume: -9,
}).connect(reverb);

// For chords in the left hand, use PolySynth
const lhChord = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.01, decay: 0.35, sustain: 0.15, release: 1.2 },
  volume: -11,
}).connect(reverb);
```

## Composition Structure

**Classical follows phrase structure — typically 4-bar or 8-bar phrases:**

1. **Antecedent phrase (0-4s):** Opening melody in right hand. Left hand Alberti bass on I chord (tonic). Ends on V (half cadence — tension).
2. **Consequent phrase (4-8s):** Melody continues or develops. Left hand harmonic progression I→IV→V→I. Ends on I (full cadence — resolution).
3. **Middle section / contrast (8-12s):** Move to relative minor or vi. Melody gets more chromatic or ornamental. Left hand may switch from Alberti to block chords.
4. **Return (12s+):** Return to opening material. Final cadence: IV→V→I.

**Alberti bass pattern at any BPM:**
- Bass note (lowest note of chord) → Upper note → Middle note → Upper note
- Repeat for each 8th note subdivision
- C major: C3 → G3 → E3 → G3
- F major: F2 → C3 → A2 → C3
- G major: G2 → D3 → B2 → D3

## Example Variations

### Variation 1: Slow movement (Andante cantabile)
```js
Tone.Transport.bpm.value = 72;
// Right hand: long notes (quarter and half notes) — singable melody
// Left hand: broken octaves instead of Alberti — just bass + high octave alternating
// Reverb slightly wetter: 0.35 — feels more intimate
// Envelope release: 2.0 — notes ring longer
```

### Variation 2: Fast passage work (Allegro vivace)
```js
Tone.Transport.bpm.value = 132;
// Right hand: 16th-note scalar run (C major scale, 2 octaves up and down)
// Left hand: block chords on beats 1 and 3 only (not Alberti — too busy)
// Use PolySynth for left hand chords: ['C3','E3','G3'], ['G2','B2','D3'], etc.
// Shorter release: 0.6 — crisp, not muddy at fast tempo
```

### Variation 3: Ornamental turn
```js
// Right hand melody includes a trill approximation
// Instead of one quarter note on E5, play: E5, F5, E5, D5, E5 as 32nd notes
// Schedule these rapid notes as very short triggerAttackRelease calls
// const trillNotes = ['E5','F5','E5','D5','E5'];
// trillNotes.forEach((n, i) => rh.triggerAttackRelease(n, '32n', time + i * 0.045));
```
