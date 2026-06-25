# Changelog

All notable changes to TuneFrames are documented here.

---

## [0.2.0] — 2026-06-24

### Added

- **Sample instrument support** via `Tone.Sampler` + [gleitz FluidR3_GM CDN](https://github.com/gleitz/midi-js-soundfonts). Eight instruments: acoustic grand piano, acoustic bass, string ensemble, brass section, nylon guitar, vibraphone, flute, choir aahs. Public domain samples, no additional installs.
- **`registry/samples.json`** — machine-readable registry of all supported CDN instruments with full URL maps and range metadata.
- **Ready-to-render presets** using real samples: `piano-salamander.html` (acoustic grand, Am–F–C–G, 8s), `bass-electric.html` (acoustic bass, walking line in C minor, 6s).
- **20 genre skills**, each with BPM guidance, chord progressions, drum patterns, instrument configs, and a verified example composition:
  - `audio-ambient`, `audio-boss-battle`, `audio-chillwave`, `audio-cinematic`, `audio-classical`
  - `audio-dnb`, `audio-downtempo`, `audio-folk`, `audio-funk`, `audio-future-bass`
  - `audio-hip-hop`, `audio-house`, `audio-indie-pop`, `audio-jazz`, `audio-lofi`
  - `audio-minimal`, `audio-orchestral`, `audio-r-and-b`, `audio-techno`, `audio-trap`
- **Total skill count: 22** (2 core + 20 genre). Install all with `npx skills add shepherd217/tuneframes`.
- **AI DJ parameterized audio surface** (`examples/example-ai-dj.html`) — single HTML file rendering four moods (`chill`, `energetic`, `dark`, `happy`) from a `?mood=` URL param. Embeds as an audio surface in any html-anything pipeline.
- **AI DJ mood variants** (`example-ai-dj-chill.html`, `example-ai-dj-dark.html`, `example-ai-dj-energetic.html`, `example-ai-dj-happy.html`) — pre-parameterized renders for each mood.

### Changed

- `package.json` keywords updated to include `soundfont`, `sampler`, `instruments`.

---

## [0.1.1] — 2026-05-15

### Added

- Initial npm publish.
- 7 verified example compositions: minimal, lo-fi, ambient, orchestral, techno, piano, bass.
- Basic CLI: `render`, `preview`, `init`.
- Core skill: `tuneframes` (composition patterns, instrument reference, duration warning).
- CLI skill: `tuneframes-cli` (command reference, render pipeline).
- Headless Chromium renderer via Playwright + `Tone.Offline`.
- `page.exposeFunction('writeFile')` binary handoff pattern — avoids CDP JSON truncation.
- WAV encoding in-browser via `audioBufferToWav`, MP3 via FFmpeg.

---

## [0.1.0] — 2026-05-14

### Added

- Initial commit. Core rendering pipeline: HTML + Tone.js → headless Chromium → WAV → FFmpeg → MP3.
- `Tone.Offline()` as the deterministic rendering context.
- Metadata block schema: `{"bpm": N, "duration": "Xs"}`.
