---
name: audio-cinematic
description: Cinematic Score — epic orchestral builds, pad swells, ostinato, tension and release
---

# TuneFrames — Cinematic Score

## Genre Profile
- BPM range: 60–90 (slow and grand; let notes breathe)
- Key characteristics: Slow harmonic rhythm, long-attack pads, ostinato string figures, brass swells on climax, no drums until climax (if at all), layered dynamics from pp to ff
- Typical instruments: String pads (PolySynth sawtooth, long attack), brass (PolySynth sawtooth, fast attack), choir pad (PolySynth sine), low piano (Synth), timpani (MembraneSynth)
- Mood: Epic, emotional, suspenseful, grand, sweeping — Zimmer / Morricone / Williams

## Core Pattern

```js
// Cinematic core: 72 BPM, Dm–Bb–F–C (minor epic progression)
async function main() {
  await Tone.start();
  Tone.Transport.bpm.value = 72;

  const bar = Tone.Time('1n').toSeconds(); // ~3.33s at 72 BPM

  // ── Grand reverb hall ────────────────────────────────────────────────
  const hall  = new Tone.Reverb({ decay: 6, preDelay: 0.05, wet: 0.6 }).toDestination();
  const hall2 = new Tone.Reverb({ decay: 4, wet: 0.4 }).toDestination();

  // ── Strings pad — slow attack, swell ─────────────────────────────────
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 1.8, decay: 0.5, sustain: 0.85, release: 4.0 }
  }).connect(hall);
  strings.volume.value = -14;

  // Dm–Bb–F–C progression (1 bar each)
  const prog = [
    ['D3','F3','A3'],     // Dm
    ['Bb2','D3','F3'],    // Bb
    ['F2','A2','C3'],     // F
    ['C3','E3','G3'],     // C
  ];
  prog.forEach((ch, i) => strings.triggerAttackRelease(ch, '1n', i * bar));

  // ── Piano ostinato (enters bar 2, driving 8ths) ───────────────────────
  const piano = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.8 }
  }).connect(hall2);
  piano.volume.value = -16;

  const q = Tone.Time('4n').toSeconds();
  const ostinato = ['D3','A3','D4','A3','F3','A3','D4','A3']; // D-A-D-A pattern
  ostinato.forEach((n, i) => piano.triggerAttackRelease(n, '8n', bar + i * q * 0.5));

  // ── Brass swell (enters bar 3) ────────────────────────────────────────
  const brass = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.2, sustain: 0.8, release: 2.0 }
  }).connect(hall);
  brass.volume.value = -18;

  brass.triggerAttackRelease(['F3','A3','C4'], '2n', bar * 2);
  brass.triggerAttackRelease(['C3','E3','G3'], '2n', bar * 3);

  // ── Timpani on climax ─────────────────────────────────────────────────
  const timp = new Tone.MembraneSynth({
    pitchDecay: 0.08, octaves: 5,
    envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 2.0 }
  }).connect(hall);
  timp.volume.value = -10;

  timp.triggerAttackRelease('D2', '4n', bar * 2);
  timp.triggerAttackRelease('A1', '4n', bar * 3);
}
```

## Instrument Configuration

```js
// Strings — sawtooth for harmonic richness, very slow attack for swell
const strings = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 1.8, decay: 0.5, sustain: 0.85, release: 4.0 }
});

// Choir/pad layer — pure sine, even slower attack for the "ahh" effect
const choir = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 2.5, decay: 0.3, sustain: 0.9, release: 5.0 }
});

// Brass — faster attack, shorter release (punchy swell)
const brass = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 2.0 }
});

// Piano ostinato — percussive, short sustain, clean
const piano = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.8 }
});

// Hall reverb — long decay for cinematic space
const hall = new Tone.Reverb({ decay: 6, preDelay: 0.05, wet: 0.6 }).toDestination();

// Volume automation for the build:
strings.volume.rampTo(-8, 4); // swell from -14 to -8 over 4s
```

## Composition Structure

1. **Silence / soft pad intro (0–3s):** Choir pad alone on tonic, barely audible — establishes space
2. **Strings enter (3–6s):** Slow-attack string swell on Dm, then Bb — harmonic foundation
3. **Ostinato begins (6–9s):** Piano or cello ostinato (repeating 8th-note figure) adds momentum
4. **Tension build (9–12s):** Strings move to dissonant chord (dim or sus), dynamics rise
5. **Brass climax (12–15s):** Full brass swell on the tonic, timpani hit, everything fortissimo
6. **Release / decay (final 2s):** Let hall reverb tail ring out — cut instruments, tail continues

## Example Variations

### 1 — Tension chord (diminished, no resolution)
```js
// Hold on a dim7 for maximum suspense before resolving
const dim = ['F#3','A3','C4','Eb4']; // F#dim7
strings.triggerAttackRelease(dim, '2n', tensionTime);
```

### 2 — Morricone-style solo melody (over strings)
```js
// High, yearning single note melody in the upper register
const solo = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.3, decay: 0.2, sustain: 0.9, release: 2.0 }
});
// Phrase: D5–C5–Bb4–A4 (descending minor scale, emotional)
const morriconeLine = ['D5','C5','Bb4','A4','F4','A4','D5'];
```

### 3 — Ostinato acceleration (builds tension)
```js
// Start with quarter-note ostinato, switch to 8ths on bar 3, 16ths on bar 4
const oSlow  = Tone.Time('4n').toSeconds();
const oFast  = Tone.Time('8n').toSeconds();
const oFast2 = Tone.Time('16n').toSeconds();
// Schedule the same note at progressively tighter intervals
```
