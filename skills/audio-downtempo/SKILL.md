---
name: audio-downtempo
description: Downtempo / Trip-Hop — dark cinematic groove, Portishead/Massive Attack vibes, breakbeat swing, vinyl texture, sub bass
---

# TuneFrames — Downtempo / Trip-Hop

## Genre Profile
- BPM range: 70-90 (always swung — 16th notes have a lazy late feel)
- Key characteristics: heavy breakbeat (kick NOT on every beat — syncopated), vinyl noise texture, sub bass movement on root notes, eerie/minor melodic line, gritty filter on everything
- Typical instruments: MembraneSynth kick, NoiseSynth snare + crackle, MonoSynth sub bass with lowpass filter, AMSynth for eerie melody, BitCrusher for lo-fi grit
- Mood: gritty, hypnotic, paranoid, late-night cinematic

## Core Pattern

```js
// Trip-hop breakbeat — NOT four-on-the-floor
// Kick: 0, 3, 5 (in 8ths) — heavy, off-balance feel
// Snare: 2, 6 (on 2 and 4 but swung)
// BPM = 82, swung feel via manual timing offsets
Tone.Transport.bpm.value = 82;

// Lo-fi grit filter
const bitCrusher = new Tone.BitCrusher(6).toDestination();
const reverb = new Tone.Reverb({ decay: 4.0, wet: 0.6 });
reverb.toDestination();
const filter = new Tone.Filter({ frequency: 2000, type: 'lowpass', rolloff: -24 });
filter.connect(reverb);

// Sub bass — the backbone
const bass = new Tone.MonoSynth({
  oscillator: { type: 'sine' },
  filter: { Q: 2, frequency: 120, type: 'lowpass' },
  envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.4 },
  volume: -4,
}).toDestination();

// Eerie melody — AMSynth gives that trembling quality
const melody = new Tone.AMSynth({
  harmonicity: 2.5,
  envelope: { attack: 0.15, decay: 0.5, sustain: 0.3, release: 1.0 },
  volume: -12,
});
melody.connect(filter);

// Breakbeat kick — syncopated
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.08, octaves: 10,
  envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.1 },
  volume: -2,
}).toDestination();

// Schedule kick on syncopated positions (seconds at 82 BPM, 1 beat = ~0.73s)
// Pattern over 2 bars (~5.85s): kick on beat 1, the "and" of 2, beat 3.5
const beatLen = 60 / 82;
[0, beatLen * 1.5, beatLen * 3, beatLen * 4, beatLen * 5.5, beatLen * 7].forEach(t => {
  Tone.Transport.scheduleOnce(time => kick.triggerAttackRelease('C1', '8n', time), t);
});
```

## Instrument Configuration

```js
// BitCrusher — vinyl artifact simulation
const bitCrusher = new Tone.BitCrusher(7); // lower = grittier
bitCrusher.toDestination();

// Dark reverb
const reverb = new Tone.Reverb({ decay: 5.0, preDelay: 0.03, wet: 0.65 });
await reverb.generate();
reverb.toDestination();

// Vinyl crackle — pink noise at very low volume, always running
const crackle = new Tone.NoiseSynth({
  noise: { type: 'pink' },
  envelope: { attack: 0.1, decay: 0.1, sustain: 1.0, release: 0.1 },
  volume: -32,
}).toDestination();
crackle.triggerAttack(); // sustain forever

// Sub bass — pure sine, filtered hard
const bass = new Tone.MonoSynth({
  oscillator: { type: 'sine' },
  filter: { Q: 3, frequency: 100, type: 'lowpass', rolloff: -24 },
  filterEnvelope: { attack: 0.05, decay: 0.5, sustain: 0.3, release: 0.8, baseFrequency: 60, octaves: 1.5 },
  envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 0.5 },
  volume: -3,
}).toDestination();

// Eerie lead — AMSynth with tremolo-like modulation
const lead = new Tone.AMSynth({
  harmonicity: 3,
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.2, decay: 0.8, sustain: 0.4, release: 2.0 },
  modulation: { type: 'sine' },
  modulationEnvelope: { attack: 0.5, decay: 0.0, sustain: 1.0, release: 0.5 },
  volume: -14,
}).connect(reverb);

// Heavy kick
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.1, octaves: 12,
  envelope: { attack: 0.001, decay: 0.6, sustain: 0, release: 0.15 },
  volume: -1,
}).toDestination();

// Snare — layered noise (pink for body, white for crack)
const snare = new Tone.NoiseSynth({
  noise: { type: 'pink' },
  envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.12 },
  volume: -8,
}).toDestination();
```

## Composition Structure

1. **Crackle intro (0-2s):** Vinyl crackle only — establishes grit and atmosphere.
2. **Bass enters (2-4s):** Sub bass plays the root. No other elements yet. Heavy.
3. **Beat drop (4-6s):** Kick + snare syncopated breakbeat joins. Still just bass + beat.
4. **Melody (6-12s):** AMSynth eerie melody over the groove. Should feel like it doesn't quite fit — that's correct.
5. **Full loop (12s+):** All elements. Melody repeats with slight variation.

**Bass movement (minor feel):**
- Root: D2 → A2 → F2 → G2 (4 beats each)
- Melody follows but at half speed — slower, more ominous

## Example Variations

### Variation 1: Pure Portishead (drum + bass only)
```js
// No melody — just kick, snare, bass, crackle
// Bass line has more movement: D2 → C2 → Bb1 → A1 (descending chromatic minor)
// Snare gets a slight BitCrusher: bitCrusher.connect(snare output)
// This is the most "hip-hop foundation" version
```

### Variation 2: Cinematic (add string texture)
```js
// PolySynth triangle wave simulating strings
// Very long attack: 3.0s, release: 4.0s
// Notes: Dm chord sustaining throughout (D3, F3, A3)
// Volume: -20 — barely audible shimmer behind the groove
```

### Variation 3: Faster / more aggressive
```js
Tone.Transport.bpm.value = 92;
// BitCrusher lower: 5 (crunchier)
// Kick volume: 0 (0dB — very present)
// Add 16th hi-hats at -24dB just for texture
// Lead melody shorter notes: 0.1s decay instead of 0.8s
```
