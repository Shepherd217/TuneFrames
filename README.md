# TuneFrames

**Agent-native music generation — for AI agents and developers.**

Write a single HTML file with Tone.js. Render it to MP3 with one CLI command. No per-render fees. No API keys. Fully deterministic.

[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white)](https://discord.gg/6VfDnxv3zC)
[![npm](https://img.shields.io/npm/dm/tuneframes?logo=npm)](https://www.npmjs.com/package/tuneframes)
[![GitHub stars](https://img.shields.io/github/stars/Shepherd217/TuneFrames)](https://github.com/Shepherd217/TuneFrames)

---

## What's New in v0.2.0

- **Sample instruments** — real acoustic piano, bass, strings, brass, guitar, vibraphone, flute, and choir via `Tone.Sampler` + the gleitz FluidR3_GM CDN. No extra installs.
- **22 agent skills** — 20 genre skills (lo-fi, jazz, techno, ambient, trap, D&B, classical, folk, funk, hip-hop, and more) plus the 2 core skills. Install any with `npx skills add shepherd217/tuneframes`.
- **AI DJ example** — a single HTML file that renders four different moods (`chill`, `energetic`, `dark`, `happy`) from a URL param. Drop it into any html-anything pipeline as a parameterized audio surface.

---

## Option 1: With an AI coding agent (recommended)

```bash
npx skills add shepherd217/tuneframes
```

Then describe what you want:

```
Create a 10-second lo-fi beat with a piano chord progression, jazz brushes, and a walking bass
```

The agent will write an HTML file and you can render it:

```bash
tuneframes render composition.html --output track.mp3
```

---

## Option 2: CLI only

```bash
npm install -g tuneframes
npx tuneframes init my-track
cd my-track
# Edit composition.html, then:
tuneframes render composition.html --output my-track.mp3
```

---

## How it works

1. **Write** — Create an HTML file using [Tone.js](https://tonejs.github.io/). `Tone.Offline()` renders the composition to an AudioBuffer with sample-accurate timing.

2. **Render** — The `tuneframes render` command:
   - Spins up a headless browser
   - Loads your HTML with Tone.js
   - Runs `Tone.Offline()` to get the AudioBuffer
   - Converts to WAV via `audioBufferToWav()`
   - Encodes to MP3 via FFmpeg

3. **Done** — Your audio file, deterministic every time.

---

## Minimal example

```html
<div id="tuneframes" style="display:none">{"bpm":120,"duration":"4s"}</div>
<script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
<script>
  async function main() {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease('C4', '2n', 0);
    synth.triggerAttackRelease('E4', '2n', '2n');
    synth.triggerAttackRelease('G4', '2n', '4n');
    synth.triggerAttackRelease('C5', '2n', '6n');
  }
</script>
```

`tuneframes render track.html --output track.mp3` — Tone.js CDN loads automatically.

> **Note on duration:** The `"duration"` field in the metadata block uses **seconds** (`"4s"`, `"10s"`). In Tone.js time notation, `n` means "whole note fractions" — `4n` = 4 quarter notes = 2 seconds at 120 BPM. Using literal seconds in metadata avoids this confusion.

---

## Sample Instruments

TuneFrames v0.2.0 adds `Tone.Sampler` support via the [gleitz FluidR3_GM CDN](https://github.com/gleitz/midi-js-soundfonts) — public domain, no extra installs, loads at render time.

### Supported instruments

| Instrument | Category | Range |
|---|---|---|
| `acoustic_grand_piano` | Piano | A0–C8 |
| `acoustic_bass` | Bass | C1–G4 |
| `string_ensemble_1` | Strings | C2–C7 |
| `brass_section` | Brass | C2–C6 |
| `acoustic_guitar_nylon` | Guitar | E2–D6 |
| `vibraphone` | Mallet | C3–C7 |
| `flute` | Woodwind | C4–A7 |
| `choir_aahs` | Choir | C3–G5 |

Full URL mappings in [`registry/samples.json`](registry/samples.json).

### Code example

```js
async function main() {
  await Tone.start();

  const piano = new Tone.Sampler({
    urls: { A4: 'A4.mp3', C4: 'C4.mp3', 'F#4': 'Fs4.mp3', A5: 'A5.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/'
  }).toDestination();

  // Wait for samples to load before scheduling — this is required
  await Tone.loaded();

  piano.triggerAttackRelease(['C4','E4','G4'], '2n', 0);
  piano.triggerAttackRelease(['F3','A3','C4'], '2n', Tone.Time('2n').toSeconds());
  piano.triggerAttackRelease(['G3','B3','D4'], '2n', Tone.Time('1n').toSeconds());
  piano.triggerAttackRelease(['C4','E4','G4'], '1n', Tone.Time('1n').toSeconds() + Tone.Time('2n').toSeconds());
}
```

Ready-to-render presets: [`registry/presets/piano-salamander.html`](registry/presets/piano-salamander.html), [`registry/presets/bass-electric.html`](registry/presets/bass-electric.html).

---

## Skills (22 total)

Install all TuneFrames skills with one command:

```bash
npx skills add shepherd217/tuneframes
```

### Core skills (2)

| Skill | Description |
|---|---|
| `tuneframes` | Tone.js composition patterns, instruments, common patterns, duration warning |
| `tuneframes-cli` | CLI command reference, render pipeline, output options |

### Genre skills (20)

ambient · boss-battle · chillwave · cinematic · classical · dnb · downtempo · folk · funk · future-bass · hip-hop · house · indie-pop · jazz · lofi · minimal · orchestral · r-and-b · techno · trap

Each genre skill includes BPM range, characteristic progressions, drum patterns, instrument configs, and a verified example composition.

---

## CLI reference

```bash
# Render a composition
tuneframes render my-track.html --output my-track.mp3

# Preview in browser (live reload)
tuneframes preview my-track.html

# Scaffold a new track
tuneframes init my-track

# Add a preset (reverb, drums, bass, chords, piano)
tuneframes add reverb-warm
tuneframes add drums-lofi
tuneframes add bass-saw
tuneframes add chord-progression
tuneframes add lead-piano
```

See [`examples/`](examples/) for full compositions — ambient, lo-fi, techno, orchestral, piano, bass, and the AI DJ parameterized example.

---

## Requirements

- Node.js 18+
- FFmpeg (`apt install ffmpeg` or `brew install ffmpeg`)

---

## Comparison

| | TuneFrames | Hyperframes | Suno API | ElevenLabs |
|---|---|---|---|---|
| Open source | ✓ | ✓ | ✗ | ✗ |
| Per-render fee | None | None | Yes | Yes |
| Agent-native | ✓ | ✓ | Wrapper | Wrapper |
| Full audio control | ✓ | ✓ | Limited | Limited |
| Deterministic output | ✓ | ✓ | ✗ | ✗ |
| Sample instruments | ✓ | N/A | N/A | N/A |
| Modality | Audio | Video | Audio | Audio |

---

## See Also

TuneFrames is the audio surface in the html-anything paradigm — write HTML, render anything.

- [Hyperframes](https://github.com/Shepherd217/Hyperframes) — the video counterpart: write HTML with GSAP/Three.js, render to MP4. Same model, same CLI pattern.

---

## License

Apache 2.0
