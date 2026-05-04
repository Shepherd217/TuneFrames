# Contributing to TuneFrames

Thanks for contributing! This guide covers how to work in this repo.

## Getting Started

```bash
git clone https://github.com/Shepherd217/TuneFrames.git
cd TuneFrames
npm install
```

Requirements: Node.js >= 18, FFmpeg.

## Project Structure

```
src/
  cli.js     — Command router (render, preview, init, validate, add)
  render.js  — Chromium + Tone.Offline + FFmpeg pipeline

examples/   — Runnable example compositions (verify before committing)

registry/
  presets/  — Preset HTML snippets for tuneframes add
```

## Build & Test

```bash
# Render all examples and verify output
for ex in examples/example-*.html; do
  node src/cli.js render "$ex" --output "/tmp/$(basename $ex .html).mp3"
done

# Check all outputs are valid
for f in /tmp/example-*.mp3; do
  size=$(stat -c%s "$f")
  [ "$size" -lt 5000 ] && echo "FAIL: $f is only $size bytes" && exit 1
done
echo "All examples valid"
```

## Adding Examples

When adding a new example:

1. Create `examples/example-<name>.html` with:
   - `<div id="tuneframes">` metadata block with correct BPM and duration
   - `async function main()` starting with `await Tone.start()`
   - Full composition (don't commit stubs)
2. Run: `node src/cli.js render examples/example-<name>.html --output /tmp/test.mp3`
3. Verify output > 5000 bytes
4. Commit the `.html` and the rendered `.mp3`

## Adding Presets

1. Create `registry/presets/<name>.html` — paste-ready HTML snippet with Tone.js
2. Update `src/cli.js` to handle the `add` command if adding a new preset
3. Test by running `node src/cli.js add <name>`

## Code Style

- 2-space indentation
- No semicolons (JS standard here)
- Single quotes for strings
- Max 80 chars per line

## Commit Rules

- Commit when something works and is testable
- Never commit broken renders
- Never commit `.mp3` or `.wav` larger than ~1MB (use Git LFS if needed)
- Commit message format: `type: short description` (lowercase, imperative)

## Publishing to npm

```bash
npm publish --access public
```

npm token is in `~/.hermes/promachos-secure-credentials.md`. Already authenticated.

## Reporting Issues

- Check existing issues before opening
- Include: TuneFrames version (`npm list tuneframes`), Node.js version, FFmpeg version, the composition HTML
- Paste the full CLI output including any FFmpeg errors