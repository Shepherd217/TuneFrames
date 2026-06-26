# TuneFrames

Write music in HTML. Render to MP3 in one command.

Built for AI agents — Claude writes a composition, TuneFrames renders it.

[![npm](https://img.shields.io/npm/dm/tuneframes?logo=npm)](https://www.npmjs.com/package/tuneframes)
[![GitHub stars](https://img.shields.io/github/stars/Shepherd217/TuneFrames)](https://github.com/Shepherd217/TuneFrames)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white)](https://discord.gg/6VfDnxv3zC)

**Demos:**
[Chrome — Synthwave 118 BPM](demos/chrome.mp3) · [Titan — Dark Cinematic 72 BPM](demos/titan.mp3) · [Velvet — Neo-Soul 88 BPM](demos/velvet-v3.mp3)

---

## Quickstart

```bash
npm install -g tuneframes
tuneframes init my-track
tuneframes render my-track/composition.html --output track.mp3
```

---

## For AI Agents

The HTML file is the source code. An agent writes it. TuneFrames renders it. No API, no credits, no black box.

```
Claude writes composition.html  →  tuneframes render  →  track.mp3
```

Every render is deterministic — the same HTML produces the same MP3, byte for byte. Fork a composition, diff it, remix it with another agent, ship it to CI. Music is code now.

- **No per-render fees.** No streaming API. Fully local.
- **Version-controlled compositions.** Branch, merge, and iterate the same way you iterate code.
- **Works everywhere.** Claude, GPT-4, Cursor, Copilot — any tool that writes code writes music.

### MCP Setup

Give Claude native music abilities with one config change:

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "tuneframes": {
      "command": "npx",
      "args": ["tuneframes-mcp"]
    }
  }
}
```

After restarting Claude Desktop, Claude gains a `render_music()` tool it calls directly. Try: *"Write me a jazz trio at 120 BPM."*

---

## How It Works

An HTML file with Tone.js code goes into a headless Chromium instance. `Tone.Offline()` renders the full composition to an `AudioBuffer` with sample-accurate timing — no audio hardware, no real-time playback. That buffer converts to WAV via `audioBufferToWav()`, then FFmpeg encodes it to MP3. The result is identical on every machine, every run.

```
HTML + Tone.js  →  Chromium (headless)  →  Tone.Offline()  →  WAV  →  FFmpeg  →  MP3
```

---

## Composition Format

Every composition is a self-contained HTML file with three required pieces: a metadata block, a Tone.js script tag, and an `async function main()`.

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":120,"duration":"16s"}</div>
  <script>
    async function main() {
      await Tone.start();

      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.3, decay: 0.1, sustain: 0.7, release: 1.5 }
      }).toDestination();

      // Dm9 – Bbmaj7 – Fmaj7 – C7sus4  (2s per chord at 120 BPM)
      pad.triggerAttackRelease(['D3','F3','A3','C4','E4'], '1.9s', 0);
      pad.triggerAttackRelease(['Bb2','D3','F3','A3'],     '1.9s', 2);
      pad.triggerAttackRelease(['F2','A2','C3','E3'],      '1.9s', 4);
      pad.triggerAttackRelease(['C3','F3','G3','Bb3'],     '1.9s', 6);
      pad.triggerAttackRelease(['D3','F3','A3','C4','E4'], '1.9s', 8);
      pad.triggerAttackRelease(['Bb2','D3','F3','A3'],     '1.9s', 10);
      pad.triggerAttackRelease(['F2','A2','C3','E3'],      '1.9s', 12);
      pad.triggerAttackRelease(['C3','F3','G3','Bb3'],     '1.9s', 14);
    }
  </script>
</body>
</html>
```

**Rules:**
- `<div id="tuneframes">` with valid JSON is required — the renderer reads BPM and duration from it
- `duration` is **literal seconds only** — `"16s"` not `"16n"` (see Gotchas)
- `async function main()` must start with `await Tone.start()`
- Schedule all notes at absolute times in seconds (or convert with `Tone.Time('2n').toSeconds()`)

---

## Skill Gallery

Install the full skill pack with: `npx skills add shepherd217/tuneframes`

Each skill ships with a BPM range, characteristic chord progressions, drum patterns, and a verified example composition.

| Genre | BPM Range |
|-------|-----------|
| ambient | 50–70 |
| boss-battle | 150–185 |
| chillwave | 90–110 |
| cinematic | 60–90 |
| classical | 80–140 |
| dnb | 165–180 |
| downtempo | 70–90 |
| folk | 80–110 |
| funk | 95–115 |
| future-bass | 140–160 |
| hip-hop | 80–95 |
| house | 120–128 |
| indie-pop | 115–140 |
| jazz | 60–240 |
| lofi | 70–90 |
| minimal | 128–135 |
| orchestral | 60–120 |
| r-and-b | 70–95 |
| techno | 130–145 |
| trap | 130–160 |

---

## Critical Gotchas

Four things that silently break agent-generated compositions:

**1. Duration is literal seconds, not note values.**
`"duration":"4n"` in the metadata block is not 4 beats. In Tone.js, `4n` means "quarter note fraction" — at 120 BPM that's 0.5 seconds. Always write `"duration":"16s"`.

**2. Reverb, Freeverb, BitCrusher, and Chebyshev are stubbed.**
These effects use AudioWorklet, which fails in headless Chromium. The renderer replaces them with passthrough `Gain` nodes automatically — sound plays through dry, wet effect is silently dropped. Use `FeedbackDelay` or `Chorus` instead.

**3. Schedule notes chronologically per instrument.**
Tone.js's `StateTimeline` requires that `triggerAttackRelease` calls on the same instrument are in non-decreasing time order. Scheduling `t=1.5` after `t=2.0` on the same synth throws:
```
Error: The time must be greater than or equal to the last scheduled time
```
Collect all hit times in an array, sort ascending, then schedule.

**4. CDN samples require the TUNEFRAMES_READY pattern.**
The renderer awaits `window.TUNEFRAMES_READY` before calling `Tone.Offline()`. When using `Tone.Sampler` with CDN URLs, set this to a Promise that resolves once samples are buffered:

```javascript
window.TUNEFRAMES_READY = (async () => {
  // pre-fetch and decode samples into window._myBuffers
  // then wrap with new Tone.ToneAudioBuffer(audioBuffer) inside Offline
})();
```

Do not use `await Tone.loaded()` inside `Tone.Offline()` — it checks a list that may be empty at call time, causing a race condition that silently drops samples.

---

## CLI Reference

```
tuneframes render <file.html>    Render composition to MP3
tuneframes init <name>           Initialize a new project with a lofi starter composition
tuneframes preview <file.html>   Open in browser for live preview
tuneframes validate <file.html>  Headless test render — confirms audio output > 5 KB
tuneframes lint <file.html>      Static HTML analysis — no render needed
tuneframes instruments           List all 128 GM instruments available via the gleitz CDN
tuneframes install <pack>        Show setup guide for drum/piano/bass sample packs
```

**render options:**
```bash
tuneframes render track.html --output track.mp3
tuneframes render track.html --output track.wav --format wav
tuneframes render track.html --timeout 120   # seconds (default: 60)
```

---

## Requirements

- Node.js 18+
- FFmpeg — `brew install ffmpeg` or `apt install ffmpeg`

Playwright Chromium is bundled — no separate browser install needed.

---

## Contributing

To add a new genre skill:

1. Create `skills/audio-<genre>/SKILL.md` with BPM range, characteristic progressions, and instrument config
2. Create `skills/audio-<genre>/example.html` — a complete, renderable composition
3. Validate it: `tuneframes validate skills/audio-<genre>/example.html`
4. Submit a PR

The `example.html` must pass validate (render to > 5 KB) before the PR can merge. That's the only gate.

---

## See Also

- [Hyperframes](https://github.com/Shepherd217/Hyperframes) — the video counterpart: write HTML with GSAP/Three.js, render to MP4

---

## License

Apache 2.0
