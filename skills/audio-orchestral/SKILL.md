---
name: audio-orchestral
description: Full orchestral writing — strings carry melody, brass punctuate, timpani on downbeats, woodwind color
---

# TuneFrames — Orchestral

## Genre Profile
- BPM range: 60-120 (varies by mood — slow for drama, faster for action)
- Key characteristics: proper voice leading between parts, strings as primary melodic voice, brass on structural downbeats, timpani emphasizes phrase endings, woodwinds add color between string phrases
- Typical instruments: PolySynth triangle (strings), PolySynth sawtooth (brass), MembraneSynth (timpani), AMSynth (woodwinds)
- Mood: cinematic, epic, emotional, noble

## Core Pattern

```js
// Orchestral texture: strings carry the tune, brass confirm the harmony
// Key = D minor, BPM = 80
Tone.Transport.bpm.value = 80;

// Hall reverb — essential for orchestral realism
const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.04, wet: 0.7 });
await reverb.generate();
reverb.toDestination();

// STRINGS — PolySynth, triangle wave, slow attack (bowing)
const strings = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.8, decay: 0.3, sustain: 0.9, release: 1.5 },
  volume: -6,
});
strings.connect(reverb);

// BRASS — PolySynth, sawtooth, medium attack (breath to tone)
const brass = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.3, decay: 0.4, sustain: 0.7, release: 0.8 },
  volume: -10,
});
brass.connect(reverb);

// TIMPANI — MembraneSynth with long resonance
const timpani = new Tone.MembraneSynth({
  pitchDecay: 0.4, octaves: 4,
  envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 0.8 },
  volume: -8,
}).connect(reverb);

// Strings: melody phrase (quarter notes + half notes)
// D minor: D E F G A Bb A G
const stringMelody = ['D4','E4','F4','G4','A4','Bb4','A4','G4'];
const stringTimes  = [0, 0.75, 1.5, 2.25, 3, 3.75, 4.5, 5.25];
stringMelody.forEach((note, i) => {
  Tone.Transport.scheduleOnce(time => {
    strings.triggerAttackRelease(note, '4n', time);
  }, stringTimes[i]);
});

// Brass: hold root + fifth on downbeats, confirm the harmony
Tone.Transport.scheduleOnce(t => brass.triggerAttackRelease(['D3','A3'], '2n', t), 0);
Tone.Transport.scheduleOnce(t => brass.triggerAttackRelease(['F3','C4'], '2n', t), 3);
Tone.Transport.scheduleOnce(t => brass.triggerAttackRelease(['G3','D4'], '2n', t), 6);

// Timpani: roll on downbeats — D2 as the root
[0, 3, 6].forEach(t => {
  Tone.Transport.scheduleOnce(time => timpani.triggerAttackRelease('D2', '8n', time), t);
});
```

## Instrument Configuration

```js
// Hall reverb — orchestras play in halls
const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.05, wet: 0.7 });
await reverb.generate();
reverb.toDestination();

// STRINGS (Violin section)
// Triangle wave approximates the bowed string harmonic spectrum (rough, not sine)
// Slow attack simulates bow catching the string
const strings = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.8, decay: 0.2, sustain: 0.95, release: 1.5 },
  volume: -5,
}).connect(reverb);

// BRASS (French horns / Trumpets)
// Sawtooth gives the harmonic richness of a brass instrument
// Medium attack = breath control into tone
const brass = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.35, decay: 0.3, sustain: 0.75, release: 1.0 },
  volume: -9,
}).connect(reverb);

// WOODWINDS (Oboe / Flute color)
// AMSynth provides the reedy, breathy quality
const woodwinds = new Tone.AMSynth({
  harmonicity: 1,
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.15, decay: 0.1, sustain: 0.85, release: 0.6 },
  modulation: { type: 'square' },
  modulationEnvelope: { attack: 0.5, decay: 0.0, sustain: 0.3, release: 0.5 },
  volume: -16,
}).connect(reverb);

// TIMPANI
// MembraneSynth: pitchDecay simulates the drum head ringing
const timpani = new Tone.MembraneSynth({
  pitchDecay: 0.35, octaves: 5,
  envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 1.0 },
  volume: -7,
}).connect(reverb);
```

## Composition Structure

**Phrase-based (not loop-based):**

1. **Statement (0-3s):** Strings introduce the melody. Brass hold the tonic chord quietly. Timpani on beat 1.
2. **Response (3-6s):** Strings move to a contrasting phrase. Brass shift to IV or V chord. Woodwinds enter between string notes.
3. **Development (6-9s):** Melody moves to upper strings (higher octave). Brass build in volume. Timpani on phrase downbeats.
4. **Cadence (9-12s):** All voices converge on a half-cadence (ends on V) or full cadence (ends on I). Timpani rolls.

**Voice leading rules:**
- Strings: move by step or small intervals. Avoid leaps larger than a 5th in the melody.
- Brass: hold common tones between chords when possible. Move the voice that needs to move.
- Woodwinds: fill in the 3rd or 7th of the chord — the color tones strings and brass don't cover.

## Example Variations

### Variation 1: Heroic major (C major, faster)
```js
Tone.Transport.bpm.value = 108;
// Key: C major — C D E F G A B C
// Brass on I, IV, V, I (C, F, G, C)
// Timpani on C2, G2 alternating
// Strings lead in 8th notes — more energetic
```

### Variation 2: Tragic minor (A minor, slow)
```js
Tone.Transport.bpm.value = 66;
// Key: A minor — A B C D E F G A
// Very slow strings: half notes and whole notes only
// Brass only enter at climax (bar 3), very quiet before that
// Timpani: soft rolls (8 rapid 32nd notes) instead of single hits
```

### Variation 3: Mysterious woodwind feature
```js
// Woodwinds take the melody for 4 bars — strings accompany
// Strings: slow tremolo (fast repeating 32nd notes on a held chord)
// Woodwinds: stepwise descending line D4→C4→B3→A3→G3
// No brass, no timpani — intimate chamber feel
```
