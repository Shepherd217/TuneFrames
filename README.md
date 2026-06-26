# TuneFrames

> Music is code now.

[![npm version](https://img.shields.io/npm/v/tuneframes)](https://www.npmjs.com/package/tuneframes) [![license](https://img.shields.io/npm/l/tuneframes)](LICENSE) [![CI](https://github.com/Shepherd217/TuneFrames/actions/workflows/ci.yml/badge.svg)](https://github.com/Shepherd217/TuneFrames/actions)

For decades, music files have been assets — things you license, not own, that live in black boxes. TuneFrames changes that. A composition is HTML. An agent writes it. You version-control it, fork it, diff it, ship it to CI. The same mental model you use for code, applied to music.

---

## Listen

| Track | Style | BPM |
|-------|-------|-----|
| [Chrome](demos/chrome.mp3) | Synthwave | 118 |
| [Titan](demos/titan.mp3) | Dark Cinematic | 72 |
| [Velvet](demos/velvet-v3.mp3) | Neo-Soul | 88 |

---

## Quickstart

```bash
npm install -g tuneframes
tuneframes init my-track
tuneframes render my-track/composition.html
```

That's it. A lo-fi loop is in `my-track/composition.html`. Open in browser for live preview. Run `render` for an offline MP3.

---

## For AI Agents

### The composition is HTML — the format agents already write.

```
Claude writes composition.html  ->  tuneframes render  ->  track.mp3
```

- No per-render fees. No API credits. Fully local and deterministic.
- Version-controlled music. Branch, merge, and iterate the same way you iterate code.
- Works with Claude, GPT-4, Cursor, Copilot — any tool that writes code.

### MCP Setup

Add one block to your Claude Desktop config and restart:

```json
{
  "mcpServers": {
    "tuneframes": {
      "command": "npx",
      "args": ["tuneframes-mcp"]
    }
  }
}
```

Windows path: `%APPDATA%\Claude\claude_desktop_config.json`

After setup, Claude gains `render_music()`, `list_skills()`, and `get_skill()` tools directly. Try: *"Write me a jazz trio at 110 BPM."*

---

## Composition Format

Every composition is a self-contained HTML file. Three required pieces: a metadata block, Tone.js, and an `async function main()`.

```html
<!DOCTYPE html>
<html>
<head><script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script></head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":120,"duration":"8s"}</div>
  <script>
    async function main() {
      await Tone.start();
      const kick  = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6 }).toDestination();
      const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0 } }).toDestination();
      const bass  = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.4 } }).toDestination();
      // 4 bars @ 120 BPM — quarter note = 0.5s, bar = 2s
      [0, 2, 4, 6].forEach(b => { kick.triggerAttackRelease('C1', '8n', b); kick.triggerAttackRelease('C1', '8n', b + 1); });
      [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5].forEach(t => snare.triggerAttackRelease('8n', t));
      ['C2', 'G2', 'A1', 'F2'].forEach((note, i) => bass.triggerAttackRelease(note, '1.9s', i * 2));
    }
  </script>
</body>
</html>
```

`duration` is literal seconds only — `"8s"` not `"8n"`. The metadata block is required; the renderer reads BPM and total duration from it.

---

## Genre Skills

Skills are composition templates. Every skill ships with a working `example.html`.

| Genre | Description |
|-------|-------------|
| ambient | Slow pad washes, reverberant space, no fixed meter. Texture over rhythm. |
| boss-battle | Orchestral brass hits, racing strings, 160+ BPM tension. The final encounter. |
| chillwave | Sun-faded synths, shimmering arpeggios, 90–110 BPM nostalgia you can't place. Summer, 2009. |
| cinematic | Swelling strings, tension builds, 60–90 BPM drama. Made for the moment everything changes. |
| classical | Sonata form, voice leading, development and recapitulation. Bach to Brahms in one JSON key. |
| dnb | 165–180 BPM Amen breaks, sub-bass pressure, jungle-wired tension. The fastest genre with the heaviest low end. |
| downtempo | Trip-hop atmospheres, vinyl texture, 70–90 BPM drift. Portishead for a Tuesday night. |
| folk | Fingerpicked acoustic, modal harmony, 80–110 BPM warmth. Campfire songs with teeth. |
| funk | Tight 16th-note bass, ghost-note snare, 95–115 BPM groove that makes standing still impossible. |
| future-bass | Distorted supersaws, pitched vocal chops, 140–160 BPM emotional overload. Festival-ready in 8 bars. |
| hip-hop | Boom-bap drums, sample-flip chords, 80–95 BPM swagger. Head nods at 90 BPM are physiologically inevitable. |
| house | Four-on-the-floor kick, open hi-hat, 120–128 BPM forward motion. The original loop machine. |
| indie-pop | Bright Rhodes, jangly guitar texture, 115–140 BPM energy that lasts exactly one summer. |
| jazz | Walking bass, chord voicings, ii-V-I progressions. Bebop to bossa. |
| lofi | Dusty samples, vinyl crackle, 80–90 BPM. The sound of 3am studying. |
| minimal | 128–135 BPM clock pulse, sparse elements, hypnotic repetition. Subtract until only the skeleton remains. |
| orchestral | Full string section, woodwinds, brass, 60–120 BPM sweep. A hundred musicians in a headless browser. |
| r-and-b | Sultry chord stacks, delayed snare, 70–95 BPM cool. Smooth like butter on a slow Sunday. |
| techno | Driving kick, acid bass, 130–145 BPM. Four-on-the-floor until dawn. |
| trap | 808 sub-bass, hi-hat triplets, 130–160 BPM modern Atlanta. Three hi-hats where one would do. |

---

## How It Works

```
HTML + Tone.js  ->  Playwright (headless)  ->  Tone.Offline()  ->  WAV  ->  FFmpeg  ->  MP3
```

The HTML goes into a headless Chromium instance. `Tone.Offline()` renders the full composition to an `AudioBuffer` with sample-accurate timing — no audio hardware, no real-time playback. That buffer converts to WAV, then FFmpeg encodes it to MP3. The result is bit-identical on every machine, every run. The same HTML always produces the same bytes.

---

## Sample Instruments

```bash
tuneframes install drums
tuneframes install piano
tuneframes install electric-piano
tuneframes install bass
tuneframes install strings
```

Each command prints the CDN URL and a copy-paste `Tone.Sampler` snippet ready to drop into any composition.

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `render <file.html>` | Render composition to MP3 (or WAV with `--format wav`) |
| `init <name>` | Initialize a new project with a lo-fi starter composition |
| `preview <file.html>` | Open in browser for live preview with hot-reload |
| `validate <file.html>` | Headless test render — confirms audio output exceeds 5 KB |
| `lint <file.html>` | Static HTML analysis — catches metadata errors without rendering |
| `instruments` | List all 128 GM instruments available via the gleitz CDN |
| `install <pack>` | Show setup guide and sampler snippet for a sample pack |

```bash
tuneframes render track.html --output track.mp3
tuneframes render track.html --output track.wav --format wav
tuneframes render track.html --timeout 120   # seconds; default 60
```

---

## Limitations

Honesty builds trust. Three things that don't work:

1. **Reverb, Freeverb, BitCrusher, and Chebyshev are stubbed to passthrough.** These effects rely on AudioWorklet, which fails in headless Chromium. The renderer replaces them with dry `Gain` nodes automatically — audio plays through unaffected. Use `FeedbackDelay` or `Chorus` instead.

2. **CDN samples require the `window.TUNEFRAMES_READY` prefetch pattern.** The renderer awaits `window.TUNEFRAMES_READY` before calling `Tone.Offline()`. When using `Tone.Sampler` with CDN URLs, resolve that promise once samples are buffered. Do not use `await Tone.loaded()` inside `Tone.Offline()` — it hits a race condition that silently drops samples. See [docs/SAMPLES.md](docs/SAMPLES.md).

3. **Notes must be scheduled chronologically per instrument.** Tone.js's `StateTimeline` requires that `triggerAttackRelease` calls on the same instrument go in non-decreasing time order. Out-of-order calls throw `Error: The time must be greater than or equal to the last scheduled time`. Collect hit times in an array, sort ascending, then schedule.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). To add a genre: create `skills/audio-<genre>/SKILL.md` with BPM range and characteristic progressions, create `skills/audio-<genre>/example.html`, and run `tuneframes validate skills/audio-<genre>/example.html` — the render must exceed 5 KB. That's the only gate.

---

## License

Apache 2.0
