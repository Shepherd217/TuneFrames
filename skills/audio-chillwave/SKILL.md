---
name: audio-chillwave
description: Chillwave / Retrowave — hazy 80s nostalgia, dreamy arpeggio over gated drum machine, warm chorus + delay, minor chords
---

# TuneFrames — Chillwave / Retrowave

## Genre Profile
- BPM range: 90-110 (laid back, never rushed)
- Key characteristics: minor key arpeggios, 80s drum machine pattern (four-on-the-floor kick, clap on 2/4, 16th hi-hats), chorus on synths, slight ping-pong delay, tape-saturated warmth
- Typical instruments: PolySynth (sawtooth with chorus), NoiseSynth hi-hats, MembraneSynth kick, FMSynth for clap texture
- Mood: nostalgic, washed-out, sun-bleached, driving at 2am

## Core Pattern

```js
// Chillwave core: minor arpeggio over 80s drum machine
// Key = A minor, BPM = 98
Tone.Transport.bpm.value = 98;

// Warm chorus on all melodic synths
const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.6 });
chorus.start(); // Chorus must be started manually
const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.55 });
const delay = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.35, wet: 0.4 });
reverb.toDestination();
delay.connect(reverb);
chorus.connect(delay);

// Main arpeggio synth — the neon heartbeat
const arp = new Tone.Synth({
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.02, decay: 0.15, sustain: 0.3, release: 0.5 },
  volume: -8,
});
arp.connect(chorus);

// A minor arpeggio pattern: Am - F - C - G
const arpNotes = ['A4','C5','E5','A5', 'F4','A4','C5','F5', 'C4','E4','G4','C5', 'G4','B4','D5','G5'];
let arpIdx = 0;
new Tone.Sequence((time) => {
  arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], '16n', time);
  arpIdx++;
}, [null], '16n').start(0);
// ^ Simpler: use scheduleRepeat or explicit schedule below
```

## Instrument Configuration

```js
// Chorus — the defining warmth of chillwave
const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.6 }).start();

// Tape-style reverb
const reverb = new Tone.Reverb({ decay: 3.0, preDelay: 0.02, wet: 0.5 });
await reverb.generate();

// Slapback-style delay (dotted 8th = that 80s bounce)
const delay = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.3, wet: 0.38 });

// Signal chain: arp → chorus → delay → reverb → destination
reverb.toDestination();
delay.connect(reverb);
chorus.connect(delay);

// Arpeggio synth — sawtooth for that retrowave shimmer
const arp = new Tone.Synth({
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.25, release: 0.4 },
  volume: -6,
});
arp.connect(chorus);

// Pad behind the arp — PolySynth with longer attack
const pad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.6, decay: 0.5, sustain: 0.7, release: 2.0 },
  volume: -16,
});
pad.connect(reverb);

// Kick — punchy 4-on-the-floor
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.06, octaves: 8,
  envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 },
  volume: -4,
}).toDestination();

// Hi-hats — 16th-note machine pattern, slightly gated
const hihat = new Tone.NoiseSynth({
  noise: { type: 'white' },
  envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
  volume: -16,
}).toDestination();

// Clap — pink noise, sits on 2 and 4
const clap = new Tone.NoiseSynth({
  noise: { type: 'pink' },
  envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 },
  volume: -10,
}).toDestination();
```

## Composition Structure

1. **Intro (0-2s):** Arp enters alone — no drums yet. Establishes the hazy tone.
2. **Drop-in (2-4s):** Kick and hi-hat join. Clap enters on 2 and 4.
3. **Full loop (4-12s):** All elements running. Pad adds chord warmth behind the arp.
4. **Variation (optional):** Drop the kick for 2 bars, let the arp breathe.

**Chord cycle (4 chords, each 1 bar):**
- Am → F → C → G (classic 80s nostalgia loop)
- Em → C → G → D (brighter alternative)
- Dm → Bb → F → C (darker, more melancholic)

## Example Variations

### Variation 1: Slower / dreamier
```js
Tone.Transport.bpm.value = 88;
// Longer attack on arp: 0.04
// Chorus depth: 0.85, wet: 0.7
// Reverb decay: 5.0 — more smear
// Drop hi-hats to 8th notes instead of 16th
```

### Variation 2: More synthwave, less chill
```js
Tone.Transport.bpm.value = 108;
// Square oscillator instead of sawtooth
// Add a bass line: MonoSynth root notes, sawtooth, lowpass filter at 400hz
// Kick volume up: -2
// Less reverb: 0.3 wet
```

### Variation 3: Pure pads (no drums)
```js
// Just the chord pad + arp, massive chorus + reverb
// Pad attack: 2.0s, release: 4.0s
// This is the most "chill" direction — remove percussion entirely
// Use a second delayed arp an octave higher for shimmer
```
