# TuneFrames

**Agent-native music generation.**

Write a single HTML file with Tone.js. Render it to MP3 or WAV with one command. No per-render fees. No Suno wrapper. Your agent, your audio.

```
npx tuneframes init my-track
cd my-track
tuneframes render track.html --output my-track.mp3
```

---

## How it works

1. **Write** — Create an HTML file using [Tone.js](https://tonejs.github.io/). Tone.Offline renders the composition to an AudioBuffer with sample-accurate timing.

2. **Render** — The `tuneframes render` command:
   - Spins up a headless browser
   - Loads your HTML with Tone.js
   - Runs `Tone.Offline()` to get the AudioBuffer
   - Converts to WAV via `audioBufferToWav()`
   - Encodes to MP3 via FFmpeg

3. **Done** — Your audio file, deterministic every time.

---

## CLI

```bash
# Install globally
npm install -g tuneframes

# Render a composition
tuneframes render my-track.html --output my-track.mp3

# Preview in browser (live reload)
tuneframes preview my-track.html

# Scaffold a new track
tuneframes init my-track
```

---

## Example

```html
<div id="tuneframes" style="display:none">{"bpm":120,"duration":"4s"}</div>
<script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
<script>
  async function main() {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease('C4', '4n', 0);
    synth.triggerAttackRelease('E4', '4n', '4n');
    synth.triggerAttackRelease('G4', '4n', '2n');
    synth.triggerAttackRelease('C5', '2n', '4n');
  }
</script>
```

`tuneframes render track.html --output track.mp3` — Tone.js CDN loads automatically; `renderComposition()` is auto-defined.

See [`examples/`](examples/) for full compositions — ambient, lo-fi, techno, orchestral, piano, and bass.

---

## Requirements

- Node.js 18+
- FFmpeg (install via `apt install ffmpeg` or `brew install ffmpeg`)

---

## Comparison

| | TuneFrames | Hyperframes | Suno API | ElevenLabs |
|---|---|---|---|---|
| Open source | ✓ | ✓ | ✗ | ✗ |
| Per-render fee | None | None | Yes | Yes |
| Agent-native | ✓ | ✓ | Wrapper | Wrapper |
| Full audio/video control | ✓ | ✓ | Limited | Limited |
| Deterministic output | ✓ | ✓ | ✗ | ✗ |
| Modality | Audio | Video | Audio | Audio |

---

## License

Apache 2.0