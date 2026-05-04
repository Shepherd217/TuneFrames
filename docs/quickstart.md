---
title: Quick Start
description: Generate your first MP3 with TuneFrames in 2 minutes.
---

# Quick Start

## 1. Install

```bash
npm install -g tuneframes
```

Requirements: Node.js >= 18, FFmpeg.

## 2. Create a Composition

```bash
npx tuneframes init my-first-track
cd my-first-track
```

This creates:
```
my-first-track/
  composition.html    # Edit this
  output/             # MP3 lands here
```

Open `composition.html` and write your music:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":120,"duration":"4s"}</div>
  <script>
    async function main() {
      await Tone.start();
      const synth = new Tone.Synth().toDestination();
      const beat = Tone.Time('4n').toSeconds();
      synth.triggerAttackRelease('C4', '4n', 0);
      synth.triggerAttackRelease('E4', '4n', beat);
      synth.triggerAttackRelease('G4', '4n', beat * 2);
      synth.triggerAttackRelease('C5', '4n', beat * 3);
    }
  </script>
</body>
</html>
```

## 3. Render

```bash
tuneframes render composition.html --output my-first-track.mp3
```

That's it. `my-first-track.mp3` is ready.

## 4. Preview in Browser

```bash
tuneframes preview composition.html
```

Opens a live-reload browser preview — changes to the HTML instantly re-render.

## Using an AI Agent

Install the TuneFrames skill for your agent:

```bash
npx skills add shepherd217/tuneframes
```

Then describe what you want:
> "Create a 10-second lofi beat with a D minor chord progression, kick and snare, and warm reverb"

The agent scaffolds the project and writes the Tone.js composition.

## Next Steps

- [Examples](../examples/example-lofi.html) — 5 runnable compositions
- [API Reference](api) — all Tone.js instruments and effects
- [CLI Reference](cli) — render, preview, init, validate