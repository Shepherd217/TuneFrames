# Changelog

All notable changes to TuneFrames are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---

## [0.3.0] - 2026-06-26

### Added

- MCP server (`tuneframes-mcp`) with `render_music`, `list_skills`, and `get_skill` tools
- `tuneframes install` command for sample pack discovery: drums, piano, electric-piano, bass, strings
- Velvet v3 flagship neo-soul demo with Salamander grand piano samples using the `TUNEFRAMES_READY` pattern
- `docs/MCP.md` setup guide for Claude Desktop and Claude Code
- `docs/SAMPLES.md` CDN sample reference with copy-paste `Tone.Sampler` snippets
- Agent instructions embedded in MCP server metadata

---

## [0.2.0] - 2026-06-15

### Added

- 20 genre skills: lofi, techno, house, jazz, r-and-b, ambient, cinematic, classical, dnb, downtempo, folk, funk, future-bass, hip-hop, chillwave, indie-pop, minimal, orchestral, trap, boss-battle
- `Tone.Sampler` support with gleitz/Salamander CDN soundfonts
- `tuneframes validate` command: headless test render, checks output > 5 KB
- `tuneframes lint` command: static HTML analysis, no render required
- `tuneframes instruments` command: lists 128 GM instruments with CDN URLs
- Headless AudioWorklet proxy: Reverb/Freeverb/BitCrusher/Chebyshev replaced with Gain passthrough via `window.Tone` Proxy
- `window.TUNEFRAMES_READY` pattern for pre-loading CDN samples before `Tone.Offline`

---

## [0.1.0] - 2026-06-01

### Added

- Initial release: HTML to WAV to MP3 via Playwright and FFmpeg
- `tuneframes render`, `init`, and `preview` commands
- 7 example compositions: lofi, ambient, orchestral, techno, piano, bass, minimal
- Preset system via `tuneframes add` and `registry/presets/`
- Binary handoff via `page.exposeFunction writeFile` (fixes ArrayBuffer truncation in CDP JSON)
