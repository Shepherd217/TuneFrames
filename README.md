# TuneFrames

**Agent-native music generation — for AI agents and developers.**

Write a single HTML file with Tone.js. Render it to MP3 with one CLI command. No per-render fees. No API keys. Fully deterministic.

[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white)](https://discord.gg/6VfDnxv3zC)
[![npm](https://img.shields.io/npm/dm/tuneframes?logo=npm)](https://www.npmjs.com/package/tuneframes)
[![GitHub stars](https://img.shields.io/github/stars/Shepherd217/TuneFrames)](https://github.com/Shepherd217/TuneFrames)

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

See [`examples/`](examples/) for full compositions — ambient, lo-fi, techno, orchestral, piano, and bass.

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
| Modality | Audio | Video | Audio | Audio |

---

## License

Apache 2.0