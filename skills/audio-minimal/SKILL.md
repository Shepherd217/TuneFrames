---
name: audio-minimal
description: Minimal techno — Robert Hood / Villalobos style. A click, a sub, a single hi-hat, one repeating note. Every sound has massive space. Groove lives in subtle velocity variation and silence.
---

# TuneFrames — Minimal Techno

## Genre Profile
- BPM range: 128–135
- Key characteristics: Extreme sparsity — 3 to 5 sounds maximum, massive amounts of silence, subtle velocity and timing micro-variations create the groove, no melodic content or filtered sweeps, hypnotic through repetition and restraint
- Typical instruments: MembraneSynth (kick/click), one MetalSynth or NoiseSynth (hi-hat), one MonoSynth (single repeating note or sub), maybe one sparse PolySynth texture
- Mood: Hypnotic, austere, cerebral, meditative, relentless

## Core Pattern

```js
// Minimal Techno — 132 BPM
// Rule: if you're adding a sound, ask whether removing it makes it better.
// The answer is usually yes.

// Click kick — not a deep sub, more of a transient "click"
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.02,   // very short pitch decay = more click, less boom
  octaves: 4,
  envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.05 }
}).toDestination();

// Sub — single note, all session, barely moving
const sub = new Tone.MonoSynth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.2 },
  filter: { type: "lowpass", frequency: 120 },
  volume: -6
}).toDestination();

// Hi-hat — one hit, lots of space, slight velocity drift
const hat = new Tone.MetalSynth({
  frequency: 400,
  envelope: { attack: 0.001, decay: 0.06, release: 0.015 },
  harmonicity: 3.1, modulationIndex: 16, resonance: 3000, octaves: 1.2,
  volume: -12
}).toDestination();

// The groove is here: velocity micro-variation on the kick
let step = 0;
const vels = [0.9, 0.75, 0.85, 0.7, 0.9, 0.8, 0.78, 0.85]; // never quite the same
new Tone.Sequence((time) => {
  kick.triggerAttackRelease("C1", "8n", time, vels[step % vels.length]);
  step++;
}, [1, null, null, null, 1, null, null, null,
    1, null, null, null, 1, null, null, null], "16n").start(0);

// Hat: only on the "and" of beat 4 — one hit per bar
new Tone.Sequence((time, val) => {
  if (val) hat.triggerAttackRelease("16n", time, 0.55 + Math.random() * 0.12);
}, [null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, 1, null], "16n").start(0);
```

## Instrument Configuration

```js
// Kick — transient-heavy click, minimal sub content
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.018,  // ultra-short = it's mostly a click/transient
  octaves: 4,
  volume: -2,
  envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.04 }
}).toDestination();

// Sub tone — sine wave, barely audible, felt not heard
// This is the floor the kick sits on
const sub = new Tone.MonoSynth({
  oscillator: { type: "sine" },
  filter: { type: "lowpass", frequency: 100 },
  envelope: { attack: 0.008, decay: 0.25, sustain: 0.7, release: 0.3 },
  volume: -10
}).toDestination();

// Hi-hat — single sparse hit, slightly random velocity = humanization
const hat = new Tone.MetalSynth({
  frequency: 380, harmonicity: 3.1, modulationIndex: 16,
  resonance: 3200, octaves: 1.2,
  envelope: { attack: 0.001, decay: 0.065, release: 0.018 },
  volume: -14
}).toDestination();

// Optional: one sparse texture note
// A single note (Tone.Synth) with long release and deep reverb
// Triggered once every 4-8 bars — the only "melodic" element
const textureVerb = new Tone.Reverb({ decay: 8.0, wet: 0.85 }).toDestination();
const texture = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.2, decay: 2.0, sustain: 0, release: 3.0 },
  volume: -18
}).connect(textureVerb);
```

## Composition Structure

Minimal techno is NOT about adding — it's about what you don't play.

- **Bar 1-4:** Kick only. Establish the pulse. Let silence speak.
- **Bar 5-8:** Add sub note on beat 1 only. Four bars of kick + one sub note per bar.
- **Bar 9-16:** Add hat — ONE hit per bar, on beat 4.5 (last 16th). That's it.
- **Bar 17-32:** No changes. Let the loop breathe. Micro-velocity variation IS the movement.
- **Bar 33:** Remove the hat. Just kick + sub. Feel the absence.
- **Bar 37:** Bring hat back at different position in the bar.
- **Bar 41:** Single texture note — sine wave through 8s reverb. Play it once. Don't repeat it for 8 bars.
- **Outro:** Remove sub. Just kick. Then silence mid-beat.

The key insight: in minimal, a sound you've heard 32 times and then REMOVED is louder in its absence than it ever was playing. Use this. Remove things. Let the memory of the sound carry the groove.

Micro-variation toolkit:
- Velocity: never the same value twice in a row — vary ±10% randomly
- Timing: slight humanization (`time + (Math.random() - 0.5) * 0.005`) on the hat only
- Filter: one slow, almost-imperceptible filter movement over 32 bars on the sub
- Volume: a 2dB swell over 8 bars, back down — the listener should feel it not notice it

## Example Variations

### 1 — Hat timing humanization (the Villalobos move)
```js
// Subtle timing displacement on hat = the groove isn't in the kick, it's here
hat.triggerAttackRelease(
  "16n",
  time + (Math.random() - 0.5) * 0.006, // ±6ms drift
  0.5 + Math.random() * 0.15
);
```

### 2 — Sub filter drift (imperceptible movement)
```js
// Extremely slow filter sweep — listener feels unease without knowing why
const now = Tone.now();
subFilter.frequency.setValueAtTime(90, now);
subFilter.frequency.linearRampToValueAtTime(140, now + 30); // over 30 seconds
subFilter.frequency.linearRampToValueAtTime(90, now + 60);
```

### 3 — Silence as event (drop the kick for 1 bar)
```js
// Most powerful move in minimal: remove kick for exactly one bar
// Use a Tone.Part to exclude one specific bar from the sequence
// The groove snaps back harder when the kick returns
let kickEnabled = true;
const kickSeq = new Tone.Sequence((time) => {
  if (kickEnabled) kick.triggerAttackRelease("C1", "8n", time);
}, [1, null, null, null, 1, null, null, null,
    1, null, null, null, 1, null, null, null], "16n");

// Disable for bar 9 only
Tone.Transport.scheduleOnce(() => { kickEnabled = false; }, "8m");
Tone.Transport.scheduleOnce(() => { kickEnabled = true; },  "9m");
```
