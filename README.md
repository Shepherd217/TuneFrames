# TuneFrames — Agent-Native Music Generation

**Write music in HTML. Render to MP3 with one CLI command.**

TuneFrames ports the same portability model that made [Hyperframes](https://github.com/Shepherd217/Hyperframes) (97K npm downloads/month) successful — to audio. Every AI agent, Claude Code session, and workflow tool can now compose music without native audio code.

```bash
npx tuneframes init my-track
cd my-track && tuneframes render composition.html
# Done. my-track/output.mp3 is ready.
```

---

## Install

```bash
npm install -g tuneframes
```

Or use it directly with `npx` — no install required to try it.

---

## Quick Start

Write a `main()` function using Tone.js:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":120,"duration":"2s"}</div>
  <script>
    async function main() {
      await Tone.start();
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease('C4', '4n', 0);
      synth.triggerAttackRelease('E4', '4n', Tone.Time('4n').toSeconds());
      synth.triggerAttackRelease('G4', '4n', Tone.Time('4n').toSeconds() * 2);
    }
  </script>
</body>
</html>
```

Render it:

```bash
npx tuneframes render composition.html --output my-track.mp3
```

---

## Examples

Run any example with `tuneframes render <path> --output <out.mp3>`.

**minimal** — C major arpeggio. Simplest possible composition. 120 BPM, 2s.

**lofi** — Chord progression + melody + kick/snare. Complete lo-fi hip-hop beat. 80 BPM, 10s.

**ambient** — Lush reverb pads + delayed crystal arpeggios over a D minor progression. 60 BPM, 4s.

**orchestral** — Strings, brass, timpani in a layered 4-bar arrangement. 72 BPM, 4s.

**techno** — 4-on-the-floor kick, offbeat hi-hats, detuned bass, pad chords. 130 BPM, 2s.

---

## API Reference

### Metadata Block

```html
<div id="tuneframes" style="display:none">{"bpm": 120, "duration": "10s"}</div>
```

- **bpm** — beats per minute (default: 120)
- **duration** — render length. Use seconds (e.g. `"10s"`) for predictable results. Tone.js time notation (`"4n"`, `"2n"`, `"1m"`) is also accepted for scheduling individual events.

### `main()` Function

Define an async `main()` in a `<script>` tag. TuneFrames waits for it to complete, then renders the offline buffer.

```js
async function main() {
  await Tone.start();
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease('C4', '4n', 0);
  // Schedule all your notes here
}
```

### Instruments

Tone.js is fully available:

- **Synth / MonoSynth / PolySynth** — basic tone generation
- **MembraneSynth** — kick drums, toms, bass drums
- **NoiseSynth** — white/pink/brown noise for hi-hats, snares, textures
- **MetalSynth** — metallic percussion (cymbals, shakers)
- **Sampler** — load your own WAV/MP3 samples

### Effects

```js
const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
const delay = new Tone.FeedbackDelay('8n', 0.4).toDestination();
const comp = new Tone.Compressor(-12, 2).toDestination();
```

---

## CLI

```bash
# Render to MP3 (default)
tuneframes render <file.html> [--output <out.mp3>]

# Render to WAV (no re-encoding)
tuneframes render <file.html> --format wav [--output <out.wav>]

# Preview in browser with live reload
tuneframes preview <file.html>

# Scaffold a new project
tuneframes init my-track
```

---

## Architecture

```
HTML + Tone.js → Chromium (headless, Tone.Offline)
                → WAV (PCM 44.1kHz mono)
                → FFmpeg
                → MP3 192kbps
```

**Tone.Offline** is the key. It renders without audio hardware or a browser audio context, producing bit-for-bit identical output every time. Same input HTML = same output MP3, guaranteed. This is what makes TuneFrames safe for agents — no randomness, no non-determinism.

---

## TuneFrames vs Hyperframes

Both follow the same portability philosophy. Different domains:

**Hyperframes**
- Output: MP4 video
- Framework: Remotion (React)
- Use case: video generation, animation

**TuneFrames**
- Output: MP3/WAV audio
- Framework: Tone.js
- Use case: music composition, sound design

Both are deterministic, open-source, and agent-native.

---

## License

Apache 2.0 — use it in any project, commercial or open-source, no strings attached.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)