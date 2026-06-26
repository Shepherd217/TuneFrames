# TuneFrames — Ultracode Handoff

## TL;DR — What We're Building

TuneFrames is being repositioned from "cool music toy" to **the format AI agents use to make music**. HTML is the source code. Agents write it. You own it. It runs anywhere.

Three independent moves. Run them in parallel.

1. **README overhaul** — sell the agent-native angle from line 1
2. **MCP server** (`src/mcp.mjs`) — one `npx tuneframes-mcp` command puts TuneFrames inside Claude/GPT/Cursor
3. **Sample library + `install` command** — `tuneframes install drums` unlocks real drum samples

Velvet v3 (`demos/velvet-v3.html` + `demos/velvet-v3.mp3`) is done but not committed yet. Commit it first, in its own commit, before the main work.

---

## Current Repo State (as of 2026-06-25)

**Published:** `tuneframes@0.2.0` on npm, `Shepherd217/TuneFrames` on GitHub (branch: main)

**Committed:**
- `src/render.js` — headless Chromium → WAV → FFmpeg pipeline
- `src/cli.js` — render, init, preview, validate, lint, add, instruments commands
- `skills/` — 20 genre skills (lofi, techno, house, jazz, r-and-b, etc.)
- `demos/chrome.html`, `demos/titan.html`, `demos/velvet.html` + their `.mp3` files
- `examples/` — 7 minimal examples
- `CLAUDE.md` — agent context

**Local only (need commit):**
- `demos/velvet-v3.html` — flagship neo-soul demo (Salamander grand piano, proper signal chain)
- `demos/velvet-v3.mp3` — rendered output
- `demos/velvet-v2.html` / `demos/velvet-v2.mp3` — superseded by v3, skip

**Key APIs:**
```javascript
// render.js exports:
const { render } = require('./render');
// render(inputFile, outputFile, format='mp3', timeoutMs=60000) → { output: string }
// format: 'mp3' | 'wav'
```

---

## Move 1: README Overhaul

**File:** `README.md` (full replacement)

### Hook (first 5 lines)

```markdown
# TuneFrames

Write music in HTML. Render to MP3 in one command.

Built for AI agents — Claude writes a composition, TuneFrames renders it.
```

### Required sections (in order):

1. **Demo audio** — Link to the 3 demos: chrome.mp3 (Synthwave), titan.mp3 (Dark Cinematic), velvet-v3.mp3 (Neo-Soul). Use relative GitHub links or raw.githubusercontent.com. Note: GitHub doesn't embed audio players, so just provide links with genre labels.

2. **Quickstart** (3 commands max):
```bash
npm install -g tuneframes
tuneframes init my-track
tuneframes render my-track/composition.html
```

3. **MCP setup** (once `tuneframes-mcp` exists):
```bash
# Add to Claude Desktop config:
npx tuneframes-mcp
# → Claude can now write and render music natively
```

4. **How it works** — one-paragraph architecture: HTML with Tone.js code → Playwright headless Chromium → `Tone.Offline()` → WAV → FFmpeg → MP3. No audio hardware needed. Fully deterministic.

5. **For AI agents** — this is the money section:
   - Claude writes the HTML, TuneFrames renders it
   - The HTML IS the source code — version-control your music, fork it, remix it
   - No per-render fees, no streaming API, runs locally
   - MCP tool puts it directly in Claude's toolbelt

6. **Skill gallery** — list all 20 genres in `skills/` as a 2-column table: Genre | BPM range | Description

7. **Genre examples** — show one concrete example: the lofi-hip-hop HTML snippet (pull from `skills/audio-lofi/SKILL.md` or `examples/example-lofi.html`)

8. **Tone.js patterns that work** — the 3 critical gotchas every agent must know:
   - Duration MUST be literal seconds (`"22s"`, NOT `"4n"`)
   - `Reverb`, `Freeverb`, `BitCrusher`, `Chebyshev` are stubbed in headless render (AudioWorklet limitation) — use `FeedbackDelay` instead
   - `StateTimeline` ordering: always schedule notes in chronological order (never go backwards in time on the same instrument)
   - Use `window.TUNEFRAMES_READY = <Promise>` to pre-fetch CDN samples before render starts

9. **Contributing** — add a genre: create `skills/audio-<genre>/SKILL.md` + `example.html`, submit PR

**Tone:** Not a toy. Not "another music gen." The format AI agents write music in. Sharp, confident, example-driven.

**Anti-pattern to avoid:** Do NOT lead with "TuneFrames is a tool for..." or any passive voice. Do NOT have a Features section with bullets. Show, don't list.

---

## Move 2: MCP Server

**New file:** `src/mcp.mjs` (ESM — `.mjs` extension works in this CJS project)

**New dependency:** `@modelcontextprotocol/sdk` (current stable version)

**New bin entry in `package.json`:**
```json
"bin": {
  "tuneframes": "src/cli.js",
  "tuneframes-mcp": "src/mcp.mjs"
}
```

### Spec

The MCP server exposes 3 tools:

#### Tool 1: `render_music`
```
Description: Compose and render music to an MP3 file. Write a complete HTML composition using Tone.js, including the required metadata block and main() function.
Input: {
  html: string        // complete HTML composition
  output?: string     // output path (default: OS temp dir)
  timeout?: number    // render timeout in seconds (default: 90)
}
Returns: { path: string, size_bytes: number }
```

#### Tool 2: `list_skills`
```
Description: List available music genre composition templates
Input: {}
Returns: { skills: Array<{ name: string, description: string, bpm_range: string }> }
```

#### Tool 3: `get_skill`
```
Description: Get an example HTML composition for a specific genre to use as a starting point
Input: { genre: string }  // e.g. "lofi", "techno", "jazz", "ambient"
Returns: { html: string, genre: string }
```

### Implementation pattern

```javascript
#!/usr/bin/env node
// src/mcp.mjs — TuneFrames MCP server

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createRequire } from 'module';
import { writeFileSync, unlinkSync, existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const require = createRequire(import.meta.url);
const { render } = require('./render.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, '../skills');
const PACKAGE_VERSION = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8')).version;
```

Key implementation notes:
- `createRequire(import.meta.url)` lets the ESM file call `require('./render.js')` which is CJS
- `render_music` writes HTML to a temp file, calls `render()`, returns `{ path, size_bytes }`
- Always clean up the temp HTML file in a `finally` block
- `list_skills` reads from `SKILLS_DIR` — each skill dir has a `SKILL.md` file; parse the first 2 lines for name/description
- `get_skill` reads `skills/audio-<genre>/example.html` — fall back gracefully if missing
- Genre name matching: `"lofi"` should find `skills/audio-lofi/`; strip the `audio-` prefix when matching
- Wrap everything in try/catch and return proper MCP error responses

### `for_agents` system prompt text

In the MCP server's `Server` constructor metadata, include a `description` that gives agents a clear mental model:

```
TuneFrames renders HTML/Tone.js compositions to MP3 audio files.
To compose music: write an HTML file with a main() function that schedules Tone.js instruments.
Required metadata: <div id="tuneframes" style="display:none">{"bpm":120,"duration":"16s"}</div>
Duration MUST be literal seconds ("16s") — not note values ("4n").
Avoid: Reverb, Freeverb, BitCrusher, Chebyshev — use FeedbackDelay instead.
Schedule notes in chronological order per instrument.
```

---

## Move 3: Sample Library + `install` Command

**Modified file:** `src/cli.js` — add `install` case to the switch statement

**New file:** `docs/SAMPLES.md`

### CLI `install` command spec

```
tuneframes install <pack>

Available packs:
  drums         — Standard kit (kick, snare, hat, crash) from gleitz CDN
  electric-piano — Rhodes-style Salamander patches (subset of Salamander)
  bass          — Electric bass samples from gleitz CDN
  strings       — Orchestral strings from gleitz CDN
  list          — List all available packs

Usage after install:
  tuneframes instruments   (already exists — shows all gleitz CDN instruments)
```

**Implementation:** This command is educational/reference only for now — it prints the CDN URLs and usage instructions, not a downloader. The actual sample files live on the CDN (tonejs.github.io, gleitz.github.io). The `install` command is a discovery layer: "here's the CDN URL, here's how to use it in an HTML composition."

This sets up the pattern for a future real downloader. For now: print usage.

```javascript
case 'install': {
  const [packName] = args;
  if (!packName || packName === 'list') {
    console.log('Available packs:\n  drums\n  electric-piano\n  bass\n  strings\n\nRun: tuneframes install <pack>');
    break;
  }
  // switch on packName, print CDN URL + usage snippet for each
  break;
}
```

### For each pack, print:
- The CDN base URL
- The note-to-filename mapping (if non-obvious)
- A copy-paste HTML snippet showing `window.TUNEFRAMES_READY` + `Tone.Sampler` init
- The `TUNEFRAMES_READY` pattern (critical — must preload before render starts)

**drums pack example output:**
```
📦 drums pack (gleitz/dave4mpls CDN)

Base URL: https://dave4mpls.github.io/midi-js-soundfonts-with-drums/FluidR3_GM/drums-mp3/{note}.mp3

Trigger map:
  C2  → Kick drum
  D2  → Snare
  F#2 → Hi-hat (closed)
  Bb2 → Hi-hat (open)
  Db3 → Crash
  Eb3 → Ride

Usage (copy into your composition):
  window.TUNEFRAMES_READY = Tone.loaded();
  const drums = new Tone.Sampler({
    urls: { 'C2': 'C2.mp3', 'D2': 'D2.mp3', 'F#2': 'Fs2.mp3' },
    baseUrl: 'https://dave4mpls.github.io/midi-js-soundfonts-with-drums/FluidR3_GM/drums-mp3/',
  }).toDestination();
```

Note: Use emoji in `install` output ONLY (it's a terminal UI thing, not docs). No emoji in code.

---

## Critical Technical Constraints

### render.js: what works in headless

**WORKS:**
- All standard Tone.js synths: `MonoSynth`, `PolySynth`, `FMSynth`, `AMSynth`, `MembraneSynth`, `NoiseSynth`, `MetalSynth`, `DuoSynth`
- `Tone.Sampler` with preloaded buffers (via `window.TUNEFRAMES_READY`)
- `FeedbackDelay`, `Chorus`, `Compressor`, `Limiter`, `Filter`, `Gain`
- `Tone.Offline()` for deterministic rendering

**BROKEN (AudioWorklet fail in headless):**
- `Reverb` — patched to a `Gain` passthrough
- `Freeverb` — same
- `BitCrusher` — same
- `Chebyshev` — same

These are proxied to `Gain` passthrough nodes automatically by `render.js`. Sound plays through dry; wet is silently dropped.

### StateTimeline ordering

Tone.js's internal state machine requires that `triggerAttackRelease` calls on the same instrument happen in monotonically non-decreasing time order. Scheduling an event at `t=1.5` AFTER scheduling `t=2.0` on the same instrument throws:

```
Error: The time must be greater than or equal to the last scheduled time
```

Fix: collect all hit times in an array, sort ascending, then schedule in order. Or ensure scheduling loops are chronological.

Exception: the `MetalSynth` is patched in render.js to silently ignore out-of-order events.

### TUNEFRAMES_READY pattern for CDN samples

render.js awaits `window.TUNEFRAMES_READY` BEFORE calling `Tone.Offline()`. Set it to a Promise that pre-fetches all CDN samples:

```javascript
window.TUNEFRAMES_READY = (async () => {
  // fetch samples into window._myBuffers
  // decode with new AudioContext()
  // do NOT use Tone.Sampler with baseUrl here — that loads lazily inside Offline
})();
```

Inside `Tone.Offline()`, wrap pre-fetched `AudioBuffer` objects with `new Tone.ToneAudioBuffer(audioBuffer)` and pass to `Tone.Sampler({ urls: { 'A4': wrappedBuffer } })`.

**Do NOT use `await Tone.loaded()`** inside `Tone.Offline()` — it checks a download list that may be empty when called, causing a race condition that silently drops samples.

---

## Commit Order

1. `feat: add velvet-v3 flagship neo-soul demo with Salamander samples` — stage `demos/velvet-v3.html` and `demos/velvet-v3.mp3`
2. `docs: overhaul README with agent-native framing and MCP setup` — stage `README.md`
3. `feat: add MCP server for native Claude/GPT integration` — stage `src/mcp.mjs`, `package.json`
4. `feat: add tuneframes install command for sample pack discovery` — stage `src/cli.js`, `docs/SAMPLES.md`

Run `npm install` after updating `package.json` and verify `node src/mcp.mjs` starts without crashing.

No `vercel --prod`. No `vercel deploy`. No tsc check needed — this is a plain JS project (no TypeScript).

---

## Success Criteria

| Move | Done when |
|------|-----------|
| velvet-v3 committed | `git log` shows the commit, `demos/velvet-v3.mp3` is tracked |
| README | Opens on GitHub and you immediately understand "agents write HTML → TuneFrames renders MP3". No "TuneFrames is a tool that..." opener. |
| MCP server | `node src/mcp.mjs` starts and accepts MCP connections; `render_music` with a minimal HTML returns a path to a real MP3 |
| install command | `tuneframes install drums` prints a complete usage guide with CDN URL and copy-paste snippet |

---

## What's Intentionally Out of Scope

- Web UI / demo site — scope creep
- Real sample downloading (writing to disk) — the CLI `install` prints usage, doesn't download
- GitHub Pages audio player — nice to have, not now
- Demo video — can't automate, manual task
- Electric piano (real Rhodes) sample set — next session after MCP is live
- npm publish — done separately by Nathan after reviewing

These are the things we talked about but agreed to defer. Don't implement them.
