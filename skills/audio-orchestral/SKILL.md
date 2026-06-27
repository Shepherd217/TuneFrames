---
name: audio-orchestral
description: Full orchestral writing — strings carry melody, brass punctuate, timpani on downbeats, woodwind color
---

# TuneFrames — Orchestral

## Genre Profile
- BPM range: 60-120 (varies by mood — slow for drama, faster for action)
- Key characteristics: proper voice leading between parts, strings as primary melodic voice, brass on structural downbeats, timpani emphasizes phrase endings, woodwinds add color between string phrases
- Typical instruments: Tone.Sampler from gleitz FluidR3_GM CDN (strings=string_ensemble_1, brass=trumpet, woodwinds=flute), MembraneSynth (timpani). Synth fallbacks activate if CDN fetch fails.
- Mood: cinematic, epic, emotional, noble

## Core Pattern

```js
// Orchestral texture: strings carry the tune, brass confirm the harmony
// Key = D minor, BPM = 80
Tone.Transport.bpm.value = 80;

// Hall reverb — essential for orchestral realism
const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.04, wet: 0.7 });
await reverb.generate();
reverb.toDestination();

// STRINGS — gleitz string_ensemble_1 Sampler, slow bow-attack
// (see Instrument Configuration section for TUNEFRAMES_READY pre-fetch pattern)
const strings = new Tone.Sampler({ urls: strUrls, attack: 0.75, release: 1.5, volume: -5 });
strings.connect(reverb);

// BRASS — gleitz trumpet Sampler, medium breath-attack; polyphonic (chord arrays work)
const brass = new Tone.Sampler({ urls: brassUrls, attack: 0.32, release: 1.0, volume: -10 });
brass.connect(reverb);

// TIMPANI — MembraneSynth with long resonance
const timpani = new Tone.MembraneSynth({
  pitchDecay: 0.4, octaves: 4,
  envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 0.8 },
  volume: -8,
}).connect(reverb);

// Strings: melody phrase (quarter notes + half notes)
// D minor: D E F G A Bb A G
const stringMelody = ['D4','E4','F4','G4','A4','Bb4','A4','G4'];
const stringTimes  = [0, 0.75, 1.5, 2.25, 3, 3.75, 4.5, 5.25];
stringMelody.forEach((note, i) => {
  Tone.Transport.scheduleOnce(time => {
    strings.triggerAttackRelease(note, '4n', time);
  }, stringTimes[i]);
});

// Brass: hold root + fifth on downbeats, confirm the harmony
Tone.Transport.scheduleOnce(t => brass.triggerAttackRelease(['D3','A3'], '2n', t), 0);
Tone.Transport.scheduleOnce(t => brass.triggerAttackRelease(['F3','C4'], '2n', t), 3);
Tone.Transport.scheduleOnce(t => brass.triggerAttackRelease(['G3','D4'], '2n', t), 6);

// Timpani: roll on downbeats — D2 as the root
[0, 3, 6].forEach(t => {
  Tone.Transport.scheduleOnce(time => timpani.triggerAttackRelease('D2', '8n', time), t);
});
```

## Instrument Configuration

Real CDN samples via gleitz FluidR3_GM. Use flat notation in URLs (Bb not As, Eb not Ds).
Pre-fetch in `window.TUNEFRAMES_READY` before `Tone.Offline`; wrap with `new Tone.ToneAudioBuffer(buf)` inside main().

```js
// Pre-fetch samples — runs before render.js calls Tone.Offline()
const _GLEITZ = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM';
window.TUNEFRAMES_READY = (async () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  window._strBufs = {};
  await Promise.all(['C4','Eb4','G4','Bb4','D5','F5'].map(async n => {
    try {
      const ab = await (await fetch(`${_GLEITZ}/string_ensemble_1-mp3/${n}.mp3`)).arrayBuffer();
      window._strBufs[n] = await ctx.decodeAudioData(ab);
    } catch (_) {}
  }));
  window._brassBufs = {};
  await Promise.all(['G2','Bb2','D3','F3','A3','C4'].map(async n => {
    try {
      const ab = await (await fetch(`${_GLEITZ}/trumpet-mp3/${n}.mp3`)).arrayBuffer();
      window._brassBufs[n] = await ctx.decodeAudioData(ab);
    } catch (_) {}
  }));
  window._fluteBufs = {};
  await Promise.all(['F4','A4','C5','F5'].map(async n => {
    try {
      const ab = await (await fetch(`${_GLEITZ}/flute-mp3/${n}.mp3`)).arrayBuffer();
      window._fluteBufs[n] = await ctx.decodeAudioData(ab);
    } catch (_) {}
  }));
})();

// Inside main() — await ready, wrap buffers, build instruments
async function main() {
  await Tone.start();
  await window.TUNEFRAMES_READY;

  const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.05, wet: 0.7 });
  await reverb.generate();
  reverb.toDestination();

  // STRINGS — string_ensemble_1 Sampler (polyphonic, slow bow-attack)
  const strUrls = {};
  for (const [n, buf] of Object.entries(window._strBufs || {}))
    strUrls[n] = new Tone.ToneAudioBuffer(buf);
  const strings = new Tone.Sampler({ urls: strUrls, attack: 0.75, release: 1.5, volume: -5 });
  strings.connect(reverb);

  // BRASS — trumpet Sampler (polyphonic, supports chord arrays)
  const brassUrls = {};
  for (const [n, buf] of Object.entries(window._brassBufs || {}))
    brassUrls[n] = new Tone.ToneAudioBuffer(buf);
  const brass = new Tone.Sampler({ urls: brassUrls, attack: 0.32, release: 1.0, volume: -10 });
  brass.connect(reverb);

  // WOODWINDS — flute Sampler
  const fluteUrls = {};
  for (const [n, buf] of Object.entries(window._fluteBufs || {}))
    fluteUrls[n] = new Tone.ToneAudioBuffer(buf);
  const woodwinds = new Tone.Sampler({ urls: fluteUrls, attack: 0.14, release: 0.6, volume: -16 });
  woodwinds.connect(reverb);

  // TIMPANI — MembraneSynth (no CDN sample; pitchDecay simulates drum head ring)
  const timpani = new Tone.MembraneSynth({
    pitchDecay: 0.35, octaves: 5,
    envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 1.0 },
    volume: -7,
  }).connect(reverb);
}
```

## Composition Structure

**Phrase-based (not loop-based):**

1. **Statement (0-3s):** Strings introduce the melody. Brass hold the tonic chord quietly. Timpani on beat 1.
2. **Response (3-6s):** Strings move to a contrasting phrase. Brass shift to IV or V chord. Woodwinds enter between string notes.
3. **Development (6-9s):** Melody moves to upper strings (higher octave). Brass build in volume. Timpani on phrase downbeats.
4. **Cadence (9-12s):** All voices converge on a half-cadence (ends on V) or full cadence (ends on I). Timpani rolls.

**Voice leading rules:**
- Strings: move by step or small intervals. Avoid leaps larger than a 5th in the melody.
- Brass: hold common tones between chords when possible. Move the voice that needs to move.
- Woodwinds: fill in the 3rd or 7th of the chord — the color tones strings and brass don't cover.

## Example Variations

### Variation 1: Heroic major (C major, faster)
```js
Tone.Transport.bpm.value = 108;
// Key: C major — C D E F G A B C
// Brass on I, IV, V, I (C, F, G, C)
// Timpani on C2, G2 alternating
// Strings lead in 8th notes — more energetic
```

### Variation 2: Tragic minor (A minor, slow)
```js
Tone.Transport.bpm.value = 66;
// Key: A minor — A B C D E F G A
// Very slow strings: half notes and whole notes only
// Brass only enter at climax (bar 3), very quiet before that
// Timpani: soft rolls (8 rapid 32nd notes) instead of single hits
```

### Variation 3: Mysterious woodwind feature
```js
// Woodwinds take the melody for 4 bars — strings accompany
// Strings: slow tremolo (fast repeating 32nd notes on a held chord)
// Woodwinds: stepwise descending line D4→C4→B3→A3→G3
// No brass, no timpani — intimate chamber feel
```
