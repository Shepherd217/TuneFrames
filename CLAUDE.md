# TuneFrames — Agent Context

## What This Repo Is

TuneFrames is an open-source music generation tool: write HTML with Tone.js, render to MP3 with one CLI command. Built for AI agents — no native audio code, no per-render fees, fully deterministic.

## Key Files

```
src/
  cli.js       — CLI entry point: render, preview, init, validate, add
  render.js    — Headless Chromium → WAV → FFmpeg pipeline

examples/
  example-minimal.html    — 2s C major arpeggio, 120 BPM
  example-lofi.html       — 10s lo-fi beat, 80 BPM
  example-ambient.html    — 16s reverb pads + arpeggio, 60 BPM
  example-orchestral.html — 14s strings/brass/timpani, 72 BPM
  example-techno.html     — 4s techno loop, 130 BPM
  example-piano.html      — 5s solo piano, 100 BPM
  example-bass.html       — 4s deep bass, 120 BPM

skills/
  tuneframes/       — Tone.js composition patterns for AI agents
  tuneframes-cli/   — CLI command reference

registry/
  presets/          — Installable preset HTML snippets
```

## Critical Tone.js Note

**Use literal seconds (`"4s"`, `"10s"`) for metadata duration. Not `"4n"`.**

`4n` in Tone.js = 4 quarter notes = 1 whole note = 2 seconds at 120 BPM. It is NOT "4 beats." Many compositions break because someone writes `"duration":"4n"` expecting 4 seconds and only gets 2.

The render pipeline: `Tone.Offline()` renders without audio hardware. All notes scheduled at `time < Tone.Offline.duration` are captured. Notes at `time >= duration` are silently dropped.

## Binary Handoff Pattern

Browser→Node binary (WAV files) uses `page.exposeFunction('writeFile')`, NOT `page.evaluate()` returning base64. The evaluate approach truncates ArrayBuffers in CDP JSON serialization. The exposeFunction approach writes directly from the browser to Node's filesystem.

If you fix a binary output bug: use `page.exposeFunction('writeFile')`.

## Development

```bash
npm install          # install deps
node src/cli.js render examples/example-lofi.html --output /tmp/test.mp3
```

## When Building Examples

1. Add metadata block: `<div id="tuneframes" style="display:none">{"bpm":N,"duration":"Xs"}</div>`
2. `main()` must be `async function main()` starting with `await Tone.start()`
3. Verify: `node src/cli.js render your-file.html --output /tmp/check.mp3 && stat -c%s /tmp/check.mp3` — must be > 5000 bytes

## npm Publishing

Token stored at `~/.hermes/promachos-secure-credentials.md`. Already authenticated — just:

```bash
npm publish --access public
```