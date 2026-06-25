---
name: audio-funk
description: Funk — slap bass, brass stabs, 16th-note hi-hats, syncopated groove that snaps
---

# TuneFrames — Funk

## Genre Profile
- BPM range: 95–115 (the pocket lives around 100–108)
- Key characteristics: Syncopated 16th-note grid, everything lands on or anticipates the beat, brass stabs on upbeats, rhythm guitar "chank" on the "and" of 2 and 4, bass owns the low end
- Typical instruments: Slap bass (Synth with fast attack + filter), brass stabs (PolySynth sawtooth, sharp envelope), rhythm guitar (PolySynth pluck), kick (MembraneSynth), tight snare (NoiseSynth), 16th hi-hats (MetalSynth)
- Mood: Infectious, locked-in, body-moving, celebratory — James Brown, Parliament, Daft Punk, Vulfpeck

## Core Pattern

```js
// Funk core: 104 BPM, E minor groove
async function main() {
  await Tone.start();
  Tone.Transport.bpm.value = 104;

  const s16 = Tone.Time('16n').toSeconds(); // one 16th note
  const q   = Tone.Time('4n').toSeconds();  // one beat

  const dest = new Tone.Gain(1).toDestination();
  const comp = new Tone.Compressor(-18, 4).connect(dest);

  // ── Slap bass ────────────────────────────────────────────────────────
  const bass = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.05 }
  }).connect(comp);
  bass.volume.value = -6;

  // Classic one-bar funk bass: E on 1, ghost note 16th early, pop on e2-and
  const bassLine = [
    { note: 'E2',  time: 0 },
    { note: 'E2',  time: s16 * 2 },
    { note: 'G2',  time: s16 * 3 },
    { note: 'E2',  time: s16 * 4 },
    { note: 'A2',  time: s16 * 6 },
    { note: 'E2',  time: s16 * 8 },
    { note: 'D2',  time: s16 * 10 },
    { note: 'E2',  time: s16 * 12 },
    { note: 'G2',  time: s16 * 14 },
  ];
  bassLine.forEach(({ note, time }) => bass.triggerAttackRelease(note, '16n', time));

  // ── Brass stabs (upbeat hits — "and" of 2 and 4) ──────────────────────
  const brass = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0.0, release: 0.08 }
  }).connect(comp);
  brass.volume.value = -12;

  // Stab on the "and" of beat 2 (s16*9) and "and" of beat 4 (s16*13)
  brass.triggerAttackRelease(['E4','G4','B4'], '16n', s16 * 9);
  brass.triggerAttackRelease(['E4','G4','B4'], '16n', s16 * 13);

  // ── Tight kick ────────────────────────────────────────────────────────
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04, octaves: 6,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 }
  }).connect(dest);
  kick.volume.value = -10;
  kick.triggerAttackRelease('C1', '8n', 0);       // beat 1
  kick.triggerAttackRelease('C1', '8n', s16 * 10); // beat 2-and-a (syncopated)

  // ── Snare on 3 ────────────────────────────────────────────────────────
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 }
  }).connect(new Tone.Filter(3500, 'bandpass').connect(dest));
  snare.volume.value = -14;
  snare.triggerAttackRelease('8n', s16 * 8); // beat 3

  // ── 16th hi-hats ─────────────────────────────────────────────────────
  const hat = new Tone.MetalSynth({
    frequency: 600, harmonicity: 5.1, modulationIndex: 32,
    resonance: 4000, octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.03, release: 0.01 }
  }).connect(dest);
  hat.volume.value = -20;
  for (let i = 0; i < 16; i++) hat.triggerAttackRelease('32n', i * s16);
}
```

## Instrument Configuration

```js
// Slap bass — square wave, nearly no sustain (percussive pluck feel)
const bass = new Tone.Synth({
  oscillator: { type: 'square' },
  envelope: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.05 }
});

// Rhythm guitar "chank" — bright pluck, bandpass filtered, chord stab
const guitar = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.003, decay: 0.15, sustain: 0.0, release: 0.08 }
});
const guitarFilter = new Tone.Filter(2500, 'bandpass');
guitar.connect(guitarFilter);

// Brass stabs — sawtooth, instant attack, very short decay (punchy, no tail)
const brass = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.005, decay: 0.12, sustain: 0.0, release: 0.08 }
});

// Bus compressor glues everything together (the "pumping" funk feel)
const comp = new Tone.Compressor({ threshold: -18, ratio: 4, attack: 0.003, release: 0.1 });
comp.toDestination();
// Route everything through comp
[bass, brass, guitar].forEach(s => s.connect(comp));
```

## Composition Structure

1. **Intro (0–2s):** Bass alone on the groove, just root and fifth — establish the pocket
2. **Drums in (2–4s):** Kick + snare + 16th hats lock with the bass
3. **Full band (4–8s):** Brass stabs enter on upbeats, guitar chank fills the midrange
4. **Breakdown (8–10s):** Strip to bass + kick only — tension before the re-hit
5. **Re-hit (10–12s):** Everything back, maybe add a filter sweep on the bass up

## Example Variations

### 1 — Open hi-hat accent on beat 4
```js
const openHat = new Tone.MetalSynth({ envelope: { decay: 0.25 } }).connect(dest);
openHat.volume.value = -18;
openHat.triggerAttackRelease('8n', q * 3); // beat 4 open
```

### 2 — Wah filter on brass (auto-wah effect)
```js
const autoWah = new Tone.AutoFilter({ frequency: 4, baseFrequency: 200, octaves: 4, wet: 0.8 });
autoWah.connect(dest);
autoWah.start(0);
brass.connect(autoWah);
```

### 3 — Daft Punk-style filtered house funk
```js
// Add LP filter sweep on the bass from 300 Hz to 2000 Hz over 4 bars
const bassFilter = new Tone.Filter(300, 'lowpass').connect(comp);
bass.connect(bassFilter);
bassFilter.frequency.rampTo(2000, bar * 4);
```
