---
name: audio-dnb
description: Drum and Bass — syncopated Amen-style breakbeat, reese bass with chorus and filter, atmospheric pad, heavy sub frequencies. Hard hitting and kinetic.
---

# TuneFrames — Drum and Bass

## Genre Profile
- BPM range: 165–180
- Key characteristics: Complex syncopated breakbeat (kick not on the beat — that's the point), heavy Reese bass (sawtooth + chorus + filter), atmospheric pad underneath, powerful sub frequencies, kinetic forward momentum
- Typical instruments: MembraneSynth (kick), NoiseSynth (snare), MetalSynth (hi-hat), FMSynth or MonoSynth (Reese bass), PolySynth (pad)
- Mood: Intense, kinetic, dark, cerebral, euphoric at the peak

## Core Pattern

```js
// Drum and Bass — 174 BPM
// Breakbeat: kick/snare NOT on beats 1,2,3,4 — syncopated Amen-style
// Reese bass: sawtooth + heavy chorus = that "wobble" character
// Pad: slow attack, atmospheric underneath

// Classic DnB breakbeat (Amen-style, 16-step)
// K=kick, S=snare, .=rest
// K . . S . K K S . . K . S . K S  (feel, not strict)
const breakPattern = [
  "kick", null,   null,  "snare", null,  "kick", "kick", "snare",
  null,   null,   "kick", null,  "snare", null,  "kick",  "snare"
];

new Tone.Sequence((time, hit) => {
  if (hit === "kick")  kick.triggerAttackRelease("C1", "8n", time);
  if (hit === "snare") snare.triggerAttackRelease("16n", time);
}, breakPattern, "16n").start(0);

// Reese bass — sawtooth through chorus
const chorus = new Tone.Chorus({ frequency: 1.8, delayTime: 3.5, depth: 0.7, wet: 0.7 });
const filter = new Tone.Filter({ frequency: 800, type: "lowpass", Q: 2 });
const reese = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.01, decay: 0.5, sustain: 0.8, release: 0.3 },
  volume: -4
}).chain(chorus, filter, Tone.Destination);
chorus.start();

Tone.Transport.bpm.value = 174;
Tone.Transport.start();
```

## Instrument Configuration

```js
// Kick — short, punchy, low
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.04,
  octaves: 5,
  envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.08 },
  volume: 2
}).toDestination();

// Snare — crisp, with slight room
const snareVerb = new Tone.Reverb({ decay: 0.5, wet: 0.15 }).toDestination();
const snare = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.04 },
  volume: -2
}).connect(snareVerb);

// Hi-hat — very fast, adds texture between beats
const hat = new Tone.MetalSynth({
  frequency: 500, harmonicity: 5.1, modulationIndex: 32,
  resonance: 4500, octaves: 1.5,
  envelope: { attack: 0.001, decay: 0.035, release: 0.01 },
  volume: -12
}).toDestination();

// Reese bass — the DnB defining sound
// Two detuned sawtooths + heavy chorus + filter
const reeseLimiter = new Tone.Limiter(-4).toDestination();
const reeseFilter = new Tone.Filter({ frequency: 700, type: "lowpass", Q: 3 }).connect(reeseLimiter);
const reeseChorus = new Tone.Chorus({
  frequency: 1.8,    // slow chorus = the "reese" movement
  delayTime: 3.5,
  depth: 0.75,
  wet: 0.75
}).connect(reeseFilter);
reeseChorus.start();
const reese = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  filter: { Q: 1, type: "lowpass", frequency: 2000 },
  filterEnvelope: { attack: 0.02, decay: 0.5, sustain: 0.5, release: 0.5,
                    baseFrequency: 200, octaves: 2 },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.3 },
  volume: -2
}).connect(reeseChorus);

// Atmospheric pad — slow attack, long release
const padVerb = new Tone.Reverb({ decay: 5.0, wet: 0.7 }).toDestination();
const pad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth4" },
  envelope: { attack: 0.6, decay: 1.0, sustain: 0.6, release: 2.5 },
  volume: -14
}).connect(padVerb);
```

## Composition Structure

- **Bar 1-2:** Breakbeat only — establish the syncopated groove immediately
- **Bar 3-4:** Add hi-hat fills between kick/snare — density builds
- **Bar 5-8:** Add Reese bass — low sustained notes, filter opens slowly
- **Bar 9-16:** Full arrangement — breakbeat + Reese + atmospheric pad
- **Variation bar:** Every 4 bars, drop a kick or add a snare roll for surprise
- **Reese movement:** Filter automation — close at bar 5, sweep open over bar 6-8, close and re-open
- **Outro:** Break strip — just pad remains, then breakbeat returns for exit

The breakbeat is the identity. The kick landing OFF the downbeat is what separates DnB from techno — resist putting the kick on beat 1. The snare DOES land around beats 2 and 4 but offset slightly.

## Example Variations

### 1 — Half-time feel bridge
```js
// Every 8 bars, drop to a 2-step pattern (kick-snare only) for 1 bar
// Builds tension before the full break returns
const halfTimeBar = ["kick", null, null, null, null, null, null, null,
                     null,   null, null, null, "snare", null, null, null];
```

### 2 — Reese filter wobble (1/4 note LFO)
```js
// LFO modulating the Reese filter — creates rhythmic wobble
const lfo = new Tone.LFO({ frequency: "4n", min: 200, max: 2000, type: "sine" });
lfo.connect(reeseFilter.frequency);
lfo.start();
```

### 3 — Snare roll into drop
```js
// 16th-note snare roll over the last bar before a new section
// Schedule 8 snare hits in last bar
for (let i = 0; i < 8; i++) {
  snare.triggerAttackRelease("32n", `${barStart} + ${i * 0.107}`, 0.3 + i * 0.087);
}
```
