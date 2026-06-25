---
name: tuneframes
description: Write music compositions in HTML using Tone.js. Use when asked to create music, audio, sound effects, beats, or any audio generation task.
---

# TuneFrames

Open-source music generation: write HTML with Tone.js, render to MP3 with one CLI command. Built for AI agents — no native audio code, no per-render fees, fully deterministic.

## When to Use This Skill

- User asks for music, a beat, soundtrack, sound effects, or audio
- User describes a musical mood (lofi, ambient, techno, orchestral) and wants output
- User wants audio for a video, game, or application
- User wants to generate music programmatically in an automated pipeline

## Core Authoring Pattern

Every TuneFrames composition is a single HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":120,"duration":"4s"}</div>
  <script>
    async function main() {
      await Tone.start();
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease('C4', '4n', 0);
    }
  </script>
</body>
</html>
```

## Metadata Block

```html
<div id="tuneframes" style="display:none">{"bpm":120,"duration":"4s"}</div>
```

- **bpm**: beats per minute (default: 120)
- **duration**: render length in **seconds** — use `"4s"`, `"10s"`, etc. Do NOT use Tone.js note values like `"4n"` for duration (see warning below)

## The `main()` Function Rules

1. Must be `async function main()`
2. Must start with `await Tone.start()`
3. All notes are scheduled relative to transport time 0
4. Tone.Offline renders deterministically — same HTML = identical MP3 every time

## Instruments

```js
// Basic tone generation
const synth = new Tone.Synth().toDestination();
const mono = new Tone.MonoSynth().toDestination();
const poly = new Tone.PolySynth(Tone.Synth).toDestination();

// Drums
const kick = new Tone.MembraneSynth().toDestination();     // Kick drum
const noise = new Tone.NoiseSynth().toDestination();        // Hi-hats, snares

// Effects
const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
const delay = new Tone.FeedbackDelay('8n', 0.4).toDestination();
const comp = new Tone.Compressor(-12, 2).toDestination();
const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination();
```

## Common Patterns

**Note timing:**
```js
const beat = Tone.Time('4n').toSeconds();
synth.triggerAttackRelease('C4', '4n', 0);          // Beat 1
synth.triggerAttackRelease('E4', '4n', beat);        // Beat 2
synth.triggerAttackRelease('G4', '4n', beat * 2);   // Beat 3
synth.triggerAttackRelease('C5', '4n', beat * 3);   // Beat 4
```

**Chord progression:**
```js
const pad = new Tone.PolySynth(Tone.Synth).toDestination();
const chords = [
  ['D3','F3','A3'],  // Dm
  ['C3','E3','G3'],  // C
  ['Bb2','D3','F3'], // Bb
  ['A2','C3','E3'],  // Am
];
const measure = Tone.Time('1n').toSeconds();
chords.forEach((chord, i) => {
  pad.triggerAttackRelease(chord, '1n', i * measure);
});
```

**Drum pattern:**
```js
const kick = new Tone.MembraneSynth().toDestination();
const snare = new Tone.NoiseSynth().toDestination();
const beat = Tone.Time('4n').toSeconds();

for (let i = 0; i < 4; i++) {
  kick.triggerAttackRelease('C1', '4n', i * beat);              // Kick on 1-4
  snare.triggerAttackRelease('C3', '4n', (i + 0.5) * beat);   // Snare on 2,4
}
```

**Lofi beat (full example):**
```js
const kick = new Tone.MembraneSynth().toDestination();
const snare = new Tone.NoiseSynth().toDestination();
const hihat = new Tone.NoiseSynth().toDestination();
const piano = new Tone.PolySynth(Tone.Synth).toDestination();
const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.4 }).toDestination();

const beat = Tone.Time('4n').toSeconds();
const bar = beat * 4;

// Kick: four on the floor
for (let i = 0; i < 4; i++) kick.triggerAttackRelease('C1', '4n', i * beat);

// Snare: 2 and 4
[1, 3].forEach(i => snare.triggerAttackRelease('C3', '4n', i * beat));

// Hi-hat: eighth notes, quiet
hihat.volume.value = -12;
for (let i = 0; i < 8; i++) hihat.triggerAttackRelease('16n', i * beat * 0.5);

// Piano: chord progression
const progression = [['D3','F3','A3'],['C3','E3','G3']];
progression.forEach((chord, i) => {
  piano.connect(reverb);
  piano.triggerAttackRelease(chord, '2n', i * bar);
});
```

## ⚠️ Duration Warning

**Use literal seconds (`"4s"`, `"10s"`) for the metadata duration.**

Tone.js note notation (`4n`, `2n`, `1n`) is a fraction of a whole note at the given BPM:
- `1n` = 1 whole note = 4 beats → at 120 BPM, 1n = 2.0s
- `2n` = 1/2 whole note = 2 beats → at 120 BPM, 2n = 1.0s
- `4n` = 1/4 whole note = 1 beat → at 120 BPM, 4n = 0.5s
- `8n` = 1/8 whole note = 1/2 beat → at 120 BPM, 8n = 0.25s

This is a common source of clipped renders. Always use seconds in the metadata block.

## CLI Reference

```bash
tuneframes render <file.html> [--output <out.mp3>]  # Render to MP3
tuneframes render <file.html> --format wav [--output <out.wav>]
tuneframes preview <file.html>   # Live preview in browser
tuneframes init <name>          # Scaffold new project
```

---

# TuneFrames — Sample Instruments

Extends the core TuneFrames skill with real instrument samples via CDN.

## Sample Pattern (Tone.Sampler + gleitz CDN)

Every sample composition must:
1. Create Tone.Sampler instances with CDN baseUrl
2. Call `await Tone.loaded()` before scheduling any notes
3. Then schedule all notes using the loaded sampler

```js
async function main() {
  await Tone.start();

  // Load piano from CDN
  const piano = new Tone.Sampler({
    urls: { A4: 'A4.mp3', C4: 'C4.mp3', 'F#4': 'Fs4.mp3', A5: 'A5.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/'
  }).toDestination();

  // CRITICAL: wait for samples to load before scheduling
  await Tone.loaded();

  // Now schedule notes
  piano.triggerAttackRelease('C4', '4n', 0);
  piano.triggerAttackRelease('E4', '4n', '4n');
  piano.triggerAttackRelease('G4', '2n', '2n');
}
```

## Available Instruments (gleitz FluidR3_GM)

Full registry: `registry/samples.json` — includes all URL mappings and per-instrument notes.

| Key | CDN path suffix | Category | Best range |
|-----|----------------|----------|------------|
| `acoustic_grand_piano` | `acoustic_grand_piano-mp3` | Piano | A0–C8 |
| `acoustic_bass` | `acoustic_bass-mp3` | Bass | C1–C4 |
| `string_ensemble_1` | `string_ensemble_1-mp3` | Strings | C2–C7 |
| `brass_section` | `brass_section-mp3` | Brass | C2–C6 |
| `acoustic_guitar_nylon` | `acoustic_guitar_nylon-mp3` | Guitar | Fs2–C6 |
| `vibraphone` | `vibraphone-mp3` | Mallet | C3–C7 |
| `flute` | `flute-mp3` | Woodwind | C4–A7 |
| `choir_aahs` | `choir_aahs-mp3` | Choir | C3–G5 |

CDN base: `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/{instrument}-mp3/`

Sharp notes use `s` suffix in filenames: F#4 → `Fs4.mp3`, D#3 → `Ds3.mp3`.

## Presets

Ready-to-render compositions in `registry/presets/`:

- `piano-salamander.html` — Am–F–C–G chord progression, acoustic grand piano, 8s
- `drums-808.html` — Trap 808 pattern, MembraneSynth + MetalSynth (no CDN), 7s
- `bass-electric.html` — Walking bass line in C minor, acoustic bass, 6s