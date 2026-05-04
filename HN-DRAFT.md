# TuneFrames: Every AI Agent Can Now Compose Music

**tl;dr:** Same idea as Hyperframes — write compositions in HTML with Tone.js, one CLI command renders to MP3. Built for agents. Apache 2.0. Published today. https://www.npmjs.com/package/tuneframes

---

## The Story

I kept asking my AI agent to add background music to the videos it was already making with Hyperframes. It couldn't. Every AI music tool required me to go to a website, log in, click buttons. The agent was helpless.

So I built TuneFrames.

The model is identical to what made Hyperframes work for video: write what you want in a format every developer already knows (HTML + Tone.js), run one CLI command, get a deterministic output file. The agent owns the whole pipeline. I just give it a prompt.

```bash
npx tuneframes init my-track
# agent writes composition.html with Tone.js
npx tuneframes render composition.html --output track.mp3
```

The agent composes, renders, and delivers. No human in the loop.

---

## How It Works

TuneFrames uses `Tone.Offline` — Tone.js's headless rendering context. No audio hardware, no browser audio context, no user gesture needed. Same composition in = same audio out, guaranteed.

```
HTML + Tone.js → Chromium (Tone.Offline) → WAV → FFmpeg → MP3/WAV
```

Five built-in examples cover the range: a simple synth melody, a full lo-fi hip-hop beat (kick + snare + chords + melody), driving techno, textural ambient, and a layered orchestral arrangement.

```html
<div id="tuneframes" style="display:none">{"bpm":80,"duration":"2n"}</div>
<script>
  async function main() {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease('A3', '4n', 0);
    synth.triggerAttackRelease('F3', '4n', Tone.Time('4n').toSeconds());
    // ...
  }
</script>
```

The metadata block tells TuneFrames the BPM and duration. Tone.js handles the rest.

---

## Why Tone.js?

Tone.js has **814,000 npm downloads per month**. It's the de facto standard for web audio. Every web developer who has ever wanted programmatic music already knows Tone.js — they just couldn't render it headlessly before.

The agent-native music tool space is empty. Every "AI music" product is a Suno or Udio wrapper with a login wall and rate limits. TuneFrames is open-source, local, and runs from a CLI. The agent's API key, the agent's compute, the agent's output.

Suno-api (the main open-source Suno wrapper) has 101 open issues and a burned-out maintainer. There's a reason: building music infrastructure is hard and the wrappers still need API keys. TuneFrames sidesteps all of that by using an established, dependency-free web standard.

---

## Portability

The key insight from Hyperframes: **agents need to be portable**. An agent that runs TuneFrames from my laptop runs the same TuneFrames from Claude Code, from OpenCLAW, from any agent platform. The composition is a single HTML file. The renderer is a single npm package. The output is deterministic.

```
Hyperframes: video for agents
TuneFrames:  music for agents
Same model. Same portability.
```

This is the MoltOS philosophy — agent identity and capabilities that move with the API key.

---

## Now It's Real

TuneFrames is live on npm: **https://www.npmjs.com/package/tuneframes**

Five examples included. Apache 2.0 license. No API key required. No per-render fees.

GitHub: **https://github.com/cusidoc/tuneframes**

Built in one session because it needed to exist. Feedback welcome.
