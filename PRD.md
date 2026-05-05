# TuneFrames — Product Requirements Document

---

## 1. Overview

**What it is:**
TuneFrames is an open-source CLI tool for agent-native music generation. An agent writes a single HTML file using Tone.js's familiar music primitives, then runs one command to render deterministic MP3/WAV output. No per-render fees. No Suno wrapper. No native audio code.

**What it solves:**
Every AI music tool today is a human-facing GUI or a rate-limited API wrapper. Agents that need to generate music — for video pipelines, game assets, accessibility tools, creative co-pilots — have no open-source option. TuneFrames gives agents what ffmpeg gives agents for video: a deterministic, scriptable, portable audio pipeline.

---

## 2. Background & Motivation

### The agentic AI wave

2026 is the year AI agents go from novelty to infrastructure. LangChain, CrewAI, AutoGen, n8n, and MoltOS are all building agent runtimes. Every agent today can:
- Read/write files
- Call APIs
- Browse the web
- Execute shell commands

**None of them can make music.**

TuneFrames closes that gap. The moment an agent can generate audio on demand, a new class of workflows becomes possible: accessibility tools that narrate visualizations, game agents that compose dynamic soundtracks, creative co-pilots that score video projects end-to-end.

### Why now

The timing is right because:
1. **Tone.js is mature** — 814K npm downloads/month, battle-tested Web Audio API abstraction
2. **Hyperframes proved the pattern** — 97K npm downloads/month in 30 days, 14K GitHub stars. Agents can own tooling. The market validated.
3. **Suno's burnout is visible** — suno-api has 101 open issues, a burnt-out maintainer, and no open-source alternative in sight
4. **FFmpeg is everywhere** — the encoding layer is solved; no proprietary audio codecs needed

---

## 3. Product Definition

### Core mechanic

```
$ npx tuneframes init my-track
$ cd my-track
$ cat > track.html
  <script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
  <script>
    // Any Tone.js composition
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.triggerAttackRelease(['C4','E4','G4'], '2n');
    Tone.Transport.start();
  </script>
  <div id="tuneframes" style="display:none">{"bpm":120,"duration":"4s"}</div>
$ tuneframes render track.html --output track.mp3
```

That's the entire product surface.

### What gets shipped

**CLI:**
- `tuneframes render <file.html> --output <out.mp3>` — headless render
- `tuneframes preview <file.html>` — live-reload browser preview
- `tuneframes init <name>` — scaffold a new track
- `tuneframes lint <file.html>` — validate composition structure

**Renderer:**
- Headless Chromium via Playwright
- `Tone.Offline()` for deterministic, sample-accurate rendering
- Browser → Node binary handoff via `page.exposeFunction('writeFile')` bridge
- WAV encoding in-browser, FFmpeg MP3 encoding

**Examples (verified working):**
- `example-minimal` — C major arpeggio, 2s
- `example-lofi` — chord progression + melody + drums, 10s, 80 BPM
- `example-techno` — kick + hat + bass + pad, 130 BPM
- `example-ambient` — reverb pads + arpeggio, D minor, 60 BPM
- `example-orchestral` — strings + brass + timpani, 72 BPM
- `example-piano` — solo piano chord voicings, 100 BPM
- `example-bass` — mono synth bass with filter, 120 BPM
- `example-ai-dj` — 4 moods: chill / energetic / dark / happy

**Distribution:**
- npm: `npm install tuneframes` / `npx tuneframes init`
- GitHub: Apache 2.0, public repo
- Hermes skill: `tuneframes-render-pipeline`
- MoltOS: first-class citizen via agent portability

### What does NOT get shipped

- A hosted rendering API (self-hosted only; keeps it open-source and fee-free)
- A web UI (agents use CLI; humans can use `preview`)
- Per-user authentication or metering (Apache 2.0, no API keys required)
- Any proprietary audio models (pure Tone.js, no ML)

---

## 4. User Stories

### Story 1: The accessibility agent
> "I have an agent that monitors a user's financial dashboard and narrates changes in speech. Now I want it to also play a subtle audio cue when significant events happen — a rising chord for gains, a minor motif for losses. I write the Tone.js composition, point the agent at it, and get a custom audio asset."

### Story 2: The game NPC composer
> "My NPC dialogue system generates contextual barks. I want each character's footsteps and ambient audio to match their personality — a heavy dwarf sounds different from a nimble elf. My game build agent composes character-specific audio at runtime from a Tone.js template."

### Story 3: The video pipeline agent
> "I have an agent that edits video. For each cut, it needs a matching audio clip — not music, just a percussive accent or ambient bed. Before TuneFrames it had to ship audio assets with the repo. Now it generates them on demand."

### Story 4: The creative co-pilot
> "I'm building an AI writing assistant that produces short stories. I want it to be able to score its own output — generate a mood-matching ambient track when it finishes a scene. The user gets a complete audio-visual experience."

### Story 5: The teacher agent
> "I have an agent that teaches music theory. It can demonstrate concepts in text. Now it can also demonstrate them in audio — play a tritone substitution, a circle-of-fifths progression, a diminished passing tone — in a Tone.js example it generates live."

---

## 5. Technical Design

### Rendering pipeline

```
HTML file (Tone.js composition)
       │
       ▼
  Playwright launches headless Chromium
       │
       ▼
  page.exposeFunction('writeFile') — Node fs bridge
       │
       ▼
  page.setContent() loads HTML + helper scripts
       │
       ▼
  Tone.Offline() renders to AudioBuffer
       │          (deterministic, no audio hardware needed)
       ▼
  audioBufferToWav() — pure JS WAV encoding in browser
       │
       ▼
  writeFile() bridge → WAV on Node filesystem
       │
       ▼
  FFmpeg (libmp3lame) → MP3
       │
       ▼
  output.mp3
```

### Determinism guarantee

`Tone.Offline()` creates an `OfflineAudioContext`. Given the same HTML input, it produces byte-identical AudioBuffer every time. This means:
- Agents can cache renders by content hash
- Test suites can assert on exact file output
- Reproducible builds, reproducible agents

### Binary handoff

Playwright's `page.evaluate()` returns JSON — binary data gets corrupted in CDP JSON serialization. Solution: `page.exposeFunction('writeFile')` lets the browser call `fs.writeFileSync` directly, bypassing CDP entirely.

### Metadata schema

```html
<div id="tuneframes" style="display:none">
  {"bpm": 120, "duration": "8s"}
</div>
```

- `bpm` (required): transport tempo
- `duration` (required): render length in seconds — use `"8s"`, NOT `"8n"`. Tone.js note notation uses the whole note as unit, not the quarter note.

### Tone.js compatibility notes

- `MetalSynth.triggerAttackRelease()` fails inside `Tone.Offline` — use `NoiseSynth` for percussion instead
- `MembraneSynth` works fine for kick drums
- Always call `await Tone.start()` at the top of `main()`
- Schedule all events within the `duration` window — events at `time >= duration` are silently dropped

---

## 6. Distribution & Growth

### Launch channels

1. **HN launch** — the same pattern as Hyperframes. Pitch: *"I built 13 tools that made me sound human. This one makes my agent sound human."* Developer audience, no marketing budget, organic amplification.
2. **LangChain Discord** — agents are hot right now; drop a demo in the #music or #audio channel
3. **GitHub trending** — Apache 2.0 + no-dependency-on-Suno makes it bookmark-worthy
4. **Agent ecosystem communities** — CrewAI, AutoGen, n8n, MoltOS users are the target audience

### Competitive positioning

| | TuneFrames | Suno API | ElevenLabs |
|---|---|---|---|
| Open source | ✓ | ✗ | ✗ |
| Per-render fee | None | Yes | Yes |
| Agent-native CLI | ✓ | Wrapper | Wrapper |
| Full audio control | ✓ | Limited | Limited |
| Deterministic output | ✓ | ✗ | ✗ |
| No account required | ✓ | ✗ | ✗ |
| No ML model | ✓ | ✗ | ✗ |

### npm growth levers

- Hyperframes already has 97K npm downloads/month — TuneFrames rides the same agent tooling wave. Agents using Hyperframes can now add audio in one import.
- `npx tuneframes init` mirrors the Hyperframes DX exactly — frictionless adoption.
- `tuneframes` vs `suno-api` — the naming is cleaner and the npm page will outrank noise.

---

## 7. Roadmap

### v0.1.x — Initial ship (current)
- [x] Renderer (Playwright + FFmpeg, writeFile bridge)
- [x] CLI (render, preview, init, lint)
- [x] 8 example compositions
- [x] npm + GitHub published
- [ ] Demo video
- [ ] Hermes skill published to skill registry
- [ ] Claude Code skill package

### v0.2 — Ecosystem integration
- [ ] `tuneframes add` command — install composition presets from a registry
- [ ] Preset registry at `registry.tuneframes.ai`
- [ ] GitHub Action: `uses: tuneframes/action@v1` — render on PR
- [ ] Cursor / VS Code extension — Tone.js autocomplete for TuneFrames files

### v1.0 — Production ready
- [ ] Smoke tests on all examples in CI
- [ ] Determinism test suite — same input must produce bit-identical output
- [ ] Windows compatibility (FFmpeg bundled via @ffmpeg/ffmpeg WASM?)
- [ ] Performance benchmarks: render time vs composition length
- [ ] `tuneframes stream` — WebSocket progress events for long renders

### v1.1 — Composition intelligence
- [ ] `tuneframes compose --prompt "sad piano loop"` — LLM generates Tone.js from natural language (via TBD LLM integration)
- [ ] Template library: game-assets, lofi, cinematic, ambient, percussion-only
- [ ] MIDI input support — agents can import existing melodies and harmonize

---

## 8. Success Metrics

### v0.1 (current)
- [ ] npm: 500 downloads/week within 30 days
- [ ] GitHub: 100 stars within 30 days
- [ ] Examples: all 8 render successfully and are FFmpeg-validated

### v1.0 target
- [ ] npm: 5,000 downloads/month
- [ ] GitHub: 1,000 stars
- [ ] At least 3 community examples submitted via PR
- [ ] Hermes skill: 10+ installs via `hermes skills tap`
- [ ] At least 1 YouTube/Twitter demo from a third party

---

## 9. Open questions

1. **Pricing for hosted rendering?** A self-hosted tool has no margin. A hosted API (small fee per render) could fund development but moves toward "Suno competitor" rather than "agent infrastructure." Decision: stay fully open-source, accept GitHub sponsorships.

2. **Preset registry or just examples?** The registry adds discoverability but adds maintenance surface. Start with `examples/` + a `registry/` dir in the repo. Graduate to a hosted registry if community contributions warrant it.

3. **Tone.js CDN vs bundled?** Currently using unpkg CDN. This means renders require internet and are non-deterministic if Tone.js changes. Consider: pin Tone.js to a specific version in `node_modules/` and load from local path. Adds complexity, gains determinism. Low priority — revisit at v1.0.

4. **Collaboration with Hyperframes users?** Hyperframes and TuneFrames share the same audience. Could TuneFrames be integrated into the Hyperframes repo as an audio output option? Or should they stay separate to avoid confusion and preserve distinct positioning?

---

*PRD v0.1 — Nathan Shepherd + Promachos, May 2026*