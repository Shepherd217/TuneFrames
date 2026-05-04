---
title: CLI Reference
description: tuneframes render, preview, init, validate, and add commands.
---

# CLI Reference

## `tuneframes render`

Render a composition to MP3 or WAV.

```bash
tuneframes render <file.html> [--output <out.mp3>]
tuneframes render <file.html> --format wav [--output <out.wav>]
```

**Pipeline:**

```
HTML + Tone.js → Chromium (Tone.Offline) → WAV (PCM 44.1kHz) → FFmpeg → MP3 192kbps
```

**Examples:**

```bash
# Default: MP3 output alongside the input file
tuneframes render composition.html

# Explicit output path
tuneframes render composition.html --output /tmp/my-track.mp3

# WAV output (no re-encoding)
tuneframes render composition.html --format wav --output my-track.wav
```

## `tuneframes preview`

Open a composition in a browser with live reload. Any save to the HTML file triggers an instant re-render.

```bash
tuneframes preview <file.html>
```

Requires a browser (Chromium/Chrome).

## `tuneframes init`

Scaffold a new TuneFrames project.

```bash
tuneframes init my-track
```

Creates:

```
my-track/
  composition.html   # scaffolded composition with comments
  output/            # rendered files go here
  README.md          # project-specific guide
```

## `tuneframes validate`

Run a headless render test on a composition. Exits 0 if the render succeeds and produces a valid MP3, exits 1 otherwise.

```bash
tuneframes validate <file.html>
```

Use this in CI/CD or pre-commit hooks.

## `tuneframes add`

Install a preset (compositional building block) into the current project.

```bash
tuneframes add <preset-name>
```

Available presets:
- `drums-lofi` — kick + snare + hihat pattern
- `reverb-warm` — long reverb chain (wet 0.7, decay 3s)
- `chord-progression` — Dm → C → Bb → Am progression
- `bass-saw` — detuned saw MonoSynth bass
- `lead-piano` — simple piano pattern

## Requirements

- **Node.js** >= 18
- **FFmpeg** — install via:
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `apt install ffmpeg`
  - Windows: [ffmpeg.org](https://ffmpeg.org/download.html) or `winget install ffmpeg`

Verify FFmpeg:

```bash
ffmpeg -version
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Render failed (file not found, FFmpeg error, etc.) |