# TuneFrames — Agent-Native Music Generation

**Write music compositions in HTML. Render them to MP3 with one CLI command.**

TuneFrames brings the same portability model that Hyperframes (97K npm downloads/month) proved for video — to audio. Every AI agent, Claude Code session, and workflow tool can now compose music without a single line of native audio code.

```bash
npx tuneframes init my-track
cd my-track && npx tuneframes render composition.html
# Done. my-track/output.mp3 is ready.
```

---

## How It Works

1. **Write HTML** with Tone.js — same API every web developer already knows
2. **Add a metadata block** so TuneFrames knows the tempo and duration
3. **Run `tuneframes render`** — Chromium headless renders the composition offline, FFmpeg encodes to MP3/WAV

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":120,"duration":"4n"}</div>
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

---

## Examples

| Example | Description | BPM | Duration |
|---------|-------------|-----|----------|
| `minimal` | Single synth melody — the simplest possible TuneFrames composition | 120 | 2s |
| `lofi` | Chord progression, melody, kick and snare — complete lo-fi hip-hop beat | 80 | 10s |
| `techno` | 4-on-the-floor kick, noise hihat, detuned bass, pad chords | 130 | 2s |
| `ambient` | Lush reverb pads, crystalline arpeggios — textural ambient | 60 | 2.5s |
| `orchestral` | Strings, brass, woodwinds in a layered orchestral arrangement | 72 | 2.5s |

Run any example:

```bash
node /root/tuneframes/src/cli.js render /root/tuneframes/examples/example-lofi.html --output /tmp/lofi.mp3
# Or after npm install -g:
tuneframes render $(npm root -g)/tuneframes/examples/example-lofi.html --output /tmp/lofi.mp3
```

---

## API Reference

### Metadata Block

Add a `<div id="tuneframes">` to the page body to tell TuneFrames how to render:

```json
{
  "bpm": 120,       // Beats per minute (default: 120)
  "duration": "4n"  // Render duration as Tone.js time (default: "4n")
}
```

TuneFrames uses [Tone.js time notation](https://tonejs.github.io/docs/latest/modules/Core.html#Time) — `4n` (quarter note), `2n` (half note), `1n` (whole note), `8n` (eighth note), `16n` (sixteenth note), or any numeric value in seconds.

### `main()` Function

Define an async `main()` function in a `<script>` tag. TuneFrames waits for it to complete, then renders the offline audio buffer.

```js
async function main() {
  await Tone.start();

  const synth = new Tone.Synth().toDestination();
  // Schedule all your notes, chords, and patterns here
  synth.triggerAttackRelease('C4', '4n', 0);
  // ...
}
```

### Instruments

Tone.js provides a complete instrument library:

- **Synth / MonoSynth / PolySynth** — basic tone generation
- **MembraneSynth** — kick drums, toms, bass drums
- **NoiseSynth** — white/pink/brown noise for hi-hats, snares, textures
- **MetalSynth** — metallic percussion (cymbals, shakers)
- **Sampler** — load your own WAV/MP3 samples

### Effects

```js
const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
const comp = new Tone.Compressor(-12, 2).toDestination();
const delay = new Tone.FeedbackDelay('8n', 0.4).toDestination();
```

---

## CLI

```bash
# Render a composition to MP3
tuneframes render <file.html> [--output <out.mp3>]

# Render to WAV (no re-encoding)
tuneframes render <file.html> --format wav [--output <out.wav>]

# Preview in browser (dev mode with live reload)
tuneframes preview <file.html>

# Scaffold a new project
tuneframes init my-track
```

---

## TuneFrames vs Hyperframes

TuneFrames is the audio sibling of [Hyperframes](https://github.com/cusidoc/hyperframes) — the same portability model, the same agent-first philosophy, but for music instead of video.

| | Hyperframes | TuneFrames |
|---|---|---|
| Output | MP4 video | MP3/WAV audio |
| Framework | Remotion (React) | Tone.js |
| Use case | Video generation, animation | Music composition, sound design |
| Deterministic | Yes | Yes |

---

## Architecture

```
HTML + Tone.js → Chromium (headless, Tone.Offline)
                → WAV ( PCM 44.1kHz mono )
                → FFmpeg
                → MP3 192kbps
```

**Tone.Offline** is the key: it renders audio without audio hardware or a browser audio context, producing bit-for-bit identical output every time. Same input HTML = same output MP3, guaranteed.

---

## License

Apache 2.0 — use it in any project, commercial or open-source, no strings attached.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
