# I built an open-source Suno killer for AI agents — 22 skills, 20 genres, real instrument samples

**tl;dr:** TuneFrames v0.2.0. Write music as HTML + Tone.js, render to MP3 with one CLI command. 22 agent skills, 20 genre presets (jazz, trap, D&B, folk, etc.), real acoustic instruments via CDN samples. Apache 2.0, no API key, no per-render fee. https://github.com/Shepherd217/TuneFrames

---

The agent music tool space is a wasteland. Suno API: login wall, rate limits, 101 open GitHub issues, burnt-out maintainer. ElevenLabs: sound effects, not music. Every wrapper still needs an API key and sends your audio somewhere.

I got sick of it. My agent could already make video with Hyperframes. It still couldn't make music. So I built TuneFrames.

## The model

Write compositions in the format every web developer already knows — HTML + Tone.js. Run one CLI command. Get a deterministic audio file. The agent owns the whole pipeline.

```bash
npx tuneframes init my-track
# agent writes composition.html with Tone.js
tuneframes render composition.html --output track.mp3
```

The code is the music. There's no black-box generative model, no "enhance my vibe" slider. Every note, every chord, every drum hit is explicit in the HTML. That's what makes it agent-native: the agent can read it, modify it, version-control it, and reproduce it byte-for-byte.

## What's in v0.2.0

**Real instrument samples.** Tone.Sampler + the gleitz FluidR3_GM CDN (public domain). Acoustic grand piano, upright bass, string ensemble, brass section, nylon guitar, vibraphone, flute, choir. No installs beyond the npm package — samples load at render time.

```js
const piano = new Tone.Sampler({
  urls: { A4: 'A4.mp3', C4: 'C4.mp3', 'F#4': 'Fs4.mp3' },
  baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/'
}).toDestination();
await Tone.loaded();
piano.triggerAttackRelease(['C4','E4','G4','B4'], '1n', 0);
```

**22 agent skills, 20 genres.** Lo-fi, jazz, techno, ambient, trap, drum & bass, classical, folk, funk, hip-hop, R&B, house, chillwave, indie-pop, cinematic, future bass, orchestral, minimal, boss battle, downtempo. Each skill ships with BPM range, chord progressions, drum patterns, instrument configs, and a verified working example. Install them all:

```bash
npx skills add shepherd217/tuneframes
```

**Parameterized audio surface.** The AI DJ example renders four different moods from a URL param — `?mood=chill`, `?mood=energetic`, `?mood=dark`, `?mood=happy`. Drop a single HTML file into any pipeline and get dynamically composed music out. This is the audio equivalent of what Hyperframes does for video: html-anything, now with sound.

## Why Tone.js

814,000 npm downloads per month. It's the de facto standard for programmatic web audio. Every web developer who's ever wanted music in their app already knows it. TuneFrames doesn't teach you a new DSL — it makes Tone.js renderable from a CLI.

The rendering trick is `Tone.Offline()` — a headless audio context that renders without hardware, without user gestures, without a browser tab. Same composition in, same audio out, every time. It's deterministic. Agents can cache by content hash, test on exact output, and reproduce builds.

## Compared to the alternatives

- **Suno API**: per-render fees, rate limits, non-deterministic, login required, 101 open issues
- **ElevenLabs sound effects**: not music, black-box, per-second billing
- **TuneFrames**: $0 per render, open-source, deterministic, no account needed, the agent reads the source

The suno-api wrapper has existed for 2 years and still can't run headlessly without brittle browser automation hacks. TuneFrames just runs. `tuneframes render track.html --output track.mp3`.

## Try it now

```bash
npx tuneframes init my-track
cd my-track
tuneframes render composition.html --output demo.mp3
```

Or install the skills and let your agent write it:

```bash
npx skills add shepherd217/tuneframes
```

GitHub: **https://github.com/Shepherd217/TuneFrames** — star it if you want more genres and instruments.

npm: **https://www.npmjs.com/package/tuneframes**

Apache 2.0. Code is music.
