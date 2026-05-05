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
<script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
<script>
  // Define 4-bar chord progression
  const chords = [
    ['C4', 'E4', 'G4'],  // C major
    ['A3', 'C4', 'E4'],  // A minor
    ['F3', 'A3', 'C4'],  // F major
    ['G3', 'B3', 'D4'],  // G major
  ];

  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  const seq = new Tone.Sequence((time, note) => {
    synth.triggerAttackRelease(note, '4n', time);
  }, chords.flat()).start(0);

  Tone.Transport.start();

  // Render with Tone.Offline
  Tone.Offline(() => {
    new Tone.PolySynth(Tone.Synth).toDestination();
    new Tone.Sequence((time, note) => {
      synth.triggerAttackRelease(note, '4n', time);
    }, chords.flat()).start(0);
    Tone.Transport.start();
  }, 8).then(buffer => {
    const wav = audioBufferToWav(buffer);
    writeFile('track.wav', Buffer.from(wav));
  });

  // Expose writeFile to the browser
  function audioBufferToWav(buffer) { /* included by tuneframes */ }
</script>
```

See [`examples/`](examples/) for full compositions — ambient, lo-fi, techno, orchestral, piano, and bass.

---

## Requirements

- Node.js 18+
- FFmpeg (install via `apt install ffmpeg` or `brew install ffmpeg`)

---

## Comparison

| | TuneFrames | Suno API | ElevenLabs |
|---|---|---|---|
| Open source | ✓ | ✗ | ✗ |
| Per-render fee | None | Yes | Yes |
| Agent-native | ✓ | Wrapper | Wrapper |
| Full audio control | ✓ | Limited | Limited |
| Deterministic output | ✓ | ✗ | ✗ |

---

## License

Apache 2.0