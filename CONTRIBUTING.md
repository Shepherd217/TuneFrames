# Contributing to TuneFrames

Thanks for wanting to help. The project is small and the main contribution path is adding a genre skill — a self-contained directory that shows AI agents (and humans) how to write compositions in a specific style. This document walks through that process end to end.

---

## Quick Start

```bash
git clone https://github.com/Shepherd217/TuneFrames.git
cd TuneFrames
npm install

# Verify the renderer works before touching anything
tuneframes render examples/example-lofi.html --output /tmp/test.mp3
# Should produce a file > 5 KB
```

If the render fails, check that Playwright's Chromium is installed (`npx playwright install chromium`) and that FFmpeg is on your PATH.

---

## Adding a Genre Skill

A genre skill lives in `skills/audio-yourgenre/` and contains two files: `SKILL.md` (documentation and patterns) and `example.html` (a working composition the renderer can produce).

### Step 1 — Create the directory

```bash
mkdir skills/audio-yourgenre
```

Use kebab-case. The `audio-` prefix keeps genre skills grouped when the directory is listed. Examples: `audio-jazz`, `audio-drum-and-bass`, `audio-bossanova`.

### Step 2 — Write SKILL.md

`SKILL.md` is reference material. It should explain the genre's characteristics, show code patterns, and describe what makes a composition feel authentic. See `skills/audio-lofi/SKILL.md` for a full example.

**Required frontmatter** (YAML block at the top of the file):

```yaml
---
name: audio-yourgenre
description: One-line description of the genre and its vibe
---
```

The `name` field must match the directory name. The `description` should be specific enough to be useful — "Drum and Bass — fast breakbeats, heavy sub-bass, 170 BPM" is better than "Electronic music."

Fill out the rest of the file with:
- Genre profile (BPM range, key characteristics, typical instruments, mood)
- A core pattern — working code that shows the essential sound
- Instrument configuration with explanations
- Composition structure (intro/main/variation/outro sketch)
- At least two example variations

### Step 3 — Write example.html

`example.html` is the composition the renderer will actually run. It must be self-contained HTML that Chromium can execute headlessly.

**Required elements:**

1. A metadata `<div>` with `id="tuneframes"` containing valid JSON:

```html
<div id="tuneframes" style="display:none">{"bpm":90,"duration":"12s"}</div>
```

Use literal seconds (`"12s"`, not `"12n"`). Notes scheduled at or after the duration are silently dropped.

2. `async function main()` that starts with `await Tone.start()`:

```html
<script>
  async function main() {
    await Tone.start();
    Tone.Transport.bpm.value = 90;
    // ... your composition
  }
</script>
```

3. A Tone.js script tag (use the CDN):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
```

**If you use `Tone.Sampler` with CDN samples**, set `window.TUNEFRAMES_READY` so the renderer waits for samples to load before recording:

```js
const piano = new Tone.Sampler({ urls: { ... }, baseUrl: '...' }).toDestination();
window.TUNEFRAMES_READY = Tone.loaded();
```

### What to avoid in example.html

These Tone.js effects fail in headless Chromium (AudioWorklet not available) and will cause silent renders or crashes:

- `Tone.Reverb` / `Tone.Freeverb` — use `Tone.FeedbackDelay` for echo and space instead
- `Tone.BitCrusher`
- `Tone.Chebyshev`

Anything that extends `Tone.Reverb` internally will also break. `Tone.Filter`, `Tone.Distortion`, `Tone.FeedbackDelay`, `Tone.PingPongDelay`, and all synths work fine.

### Notes must be chronological per instrument

Schedule each instrument's notes in ascending time order. Tone.js triggers work correctly regardless of order, but reviewers (and future readers) should be able to read the timeline without jumping around.

### Step 4 — Test

Run both checks before opening a PR:

```bash
# Validate: does it render and produce audio?
tuneframes validate skills/audio-yourgenre/example.html
# Expects: OK: skills/audio-yourgenre/example.html — N bytes (N must be > 5000)

# Lint: static check, no render needed, runs instantly
tuneframes lint skills/audio-yourgenre/example.html
# Expects: OK: skills/audio-yourgenre/example.html
```

If `validate` fails silently (renders but produces tiny output), the most common causes are:
- Duration too short — try at least `"8s"`
- All notes scheduled past the duration cutoff
- A banned effect (Reverb/BitCrusher/Chebyshev) causing a silent failure

---

## SKILL.md Format

Copy this template and fill it in:

```markdown
---
name: audio-yourgenre
description: Genre Name — brief characteristic summary, BPM ballpark, vibe
---

# TuneFrames — Genre Name

## Genre Profile
- BPM range: 70–90
- Key characteristics: describe the harmonic language, rhythmic feel, and production style
- Typical instruments: list synth types (PolySynth, MembraneSynth, MetalSynth, Sampler, etc.)
- Mood: two or three adjectives

## Core Pattern

\`\`\`js
async function main() {
  await Tone.start();
  Tone.Transport.bpm.value = 80;

  // Show the essential pattern for this genre
}
\`\`\`

## Instrument Configuration

\`\`\`js
// Explain the key synth parameters and why they create the genre sound
\`\`\`

## Composition Structure

1. **Intro (0–Xs):** describe what enters
2. **Main (Xs–Xs):** full arrangement
3. **Variation (Xs–Xs):** what changes
4. **Outro:** how it resolves

## Example Variations

### 1 — Variation name
\`\`\`js
// Show a meaningful alternative
\`\`\`

### 2 — Another variation
\`\`\`js
// Show another meaningful alternative
\`\`\`
```

---

## PR Checklist

Before submitting:

- [ ] `tuneframes lint skills/audio-yourgenre/example.html` passes
- [ ] `tuneframes validate skills/audio-yourgenre/example.html` passes (output > 5 KB)
- [ ] `SKILL.md` has `name` and `description` frontmatter fields
- [ ] No `Tone.Reverb`, `Tone.Freeverb`, `Tone.BitCrusher`, or `Tone.Chebyshev` in `example.html`
- [ ] Genre directory name is kebab-case with `audio-` prefix

---

## Commit Conventions

Prefix every commit with a type:

```
feat: add audio-bossanova genre skill
fix: correct example.html duration in audio-jazz
docs: expand variation section in audio-funk SKILL.md
refactor: simplify bass pattern in audio-house example
```

One logical change per commit. If you add a genre skill and also fix a bug in an existing one, those are two separate commits.

---

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be direct, be kind, and focus on the work.
