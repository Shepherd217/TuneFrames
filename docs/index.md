---
title: TuneFrames Docs
description: Write music in HTML, render to MP3. Agent-native music generation.
---

# TuneFrames

**Write music in HTML. Render to MP3 with one CLI command.**

TuneFrames brings the portability model that made Hyperframes (97K npm downloads/month) successful — to music. Every AI agent, Claude Code session, and workflow tool can now compose music without native audio code.

## Quick Links

- [Quick Start](quickstart) — 2-minute setup
- [API Reference](api) — Tone.js instruments and effects
- [CLI Reference](cli) — render, preview, init, validate
- [Examples](../examples/example-minimal.html) — 5 runnable compositions

## What is TuneFrames?

TuneFrames is an open-source music generation tool: write HTML with Tone.js, render to MP3 with one CLI command. Built for AI agents.

```
HTML + Tone.js → Chromium (Tone.Offline) → WAV → FFmpeg → MP3
```

Same input HTML = identical output MP3. Fully deterministic.

## Key Features

- **HTML-native** — compositions are HTML files with Tone.js. No React, no proprietary DSL.
- **AI-first** — agents already speak HTML. The CLI is non-interactive by default.
- **Deterministic rendering** — same input = identical output. Built for automated pipelines.
- **Tone.js** — 814K npm downloads/month. Proven, stable, familiar.
- **Apache 2.0** — fully open source, no per-render fees.

## Get Started

```bash
npm install -g tuneframes
npx tuneframes init my-track
cd my-track
# Edit composition.html, then:
tuneframes render composition.html --output my-track.mp3
```

Or with an AI agent:

```bash
npx skills add shepherd217/tuneframes
# "Create a 10-second lofi beat with a D minor chord progression"
```

See [Quick Start](quickstart) for the full guide.