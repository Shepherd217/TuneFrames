---
name: tuneframes-cli
description: CLI commands for TuneFrames — render, preview, init, validate. Load this skill when working with the tuneframes CLI.
---

# TuneFrames CLI

## Commands

```bash
# Render composition to MP3
tuneframes render <file.html> [--output <out.mp3>]

# Render to WAV (no re-encoding)
tuneframes render <file.html> --format wav [--output <out.wav>]

# Preview in browser (live reload)
tuneframes preview <file.html>

# Scaffold a new project
tuneframes init my-track

# Validate a composition (headless render test)
tuneframes validate <file.html>
```

## Rendering Pipeline

```
HTML + Tone.js → Chromium (headless, Tone.Offline)
                → WAV (PCM 44.1kHz mono)
                → FFmpeg
                → MP3 192kbps
```

Tone.Offline renders without audio hardware. Same input HTML = identical output MP3. This is what makes TuneFrames safe for automated pipelines.

## Requirements

- Node.js >= 18
- FFmpeg (install via: `apt install ffmpeg` or `brew install ffmpeg`)

## Output Locations

Default: input file's directory with same basename, `.mp3` extension.
`--output` flag overrides: `tuneframes render in.html --output /tmp/out.mp3`