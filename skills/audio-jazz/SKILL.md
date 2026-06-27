---
name: audio-jazz
description: Jazz — ii-V-I changes, extended chords, walking bass, swing feel, bebop melody
---

# TuneFrames — Jazz

## Genre Profile
- BPM range: 100–180 (ballad 60–90, bebop 180–240)
- Key characteristics: ii-V-I progressions, extended/altered chords (maj7, min7, dom7, dim7), swing 8th notes, call-and-response phrasing
- Typical instruments: Piano (Sampler — Salamander Grand CDN), walking upright bass (Sampler — acoustic_bass CDN), tenor sax melody (Sampler — tenor_sax CDN), ride cymbal (MetalSynth), brush snare (NoiseSynth)
- Mood: Sophisticated, improvisatory, warm, intellectually alive

## Core Pattern

```js
// Jazz core: 120 BPM swing, Dm7–G7–Cmaj7 (ii-V-I in C major)
async function main() {
  await Tone.start();
  Tone.Transport.bpm.value = 120;

  const reverb = new Tone.Reverb({ decay: 1.8, wet: 0.3 }).toDestination();

  // ── Piano voicings (shell voicings: root + 3rd + 7th) ─────────────────
  const piano = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 1.2 }
  }).connect(reverb);
  piano.volume.value = -10;

  const bar = Tone.Time('1n').toSeconds(); // 1 bar in seconds

  // ii–V–I–I in C (shell voicings)
  const changes = [
    ['D3','F3','C4'],      // Dm7 (ii)
    ['G3','B3','F4'],      // G7  (V)
    ['C3','E3','B3'],      // Cmaj7 (I)
    ['C3','E3','G3','B3'], // Cmaj7 full (I hold)
  ];
  changes.forEach((ch, i) => piano.triggerAttackRelease(ch, '1n', i * bar));

  // ── Walking bass (quarter notes, chromatic approach notes) ────────────
  const bass = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.2 }
  }).connect(reverb);
  bass.volume.value = -8;

  // Classic walking line: D–F–A–C / G–B–D–F / C–E–G–B / C–E–G–C
  const walk = ['D2','F2','A2','C3','G2','B2','D3','F3','C2','E2','G2','B2','C2','E2','G2','C3'];
  const q = Tone.Time('4n').toSeconds();
  walk.forEach((n, i) => bass.triggerAttackRelease(n, '4n', i * q));

  // ── Ride cymbal (swing pattern: 1–2–ah–3–4–ah) ────────────────────────
  const ride = new Tone.MetalSynth({
    frequency: 250, harmonicity: 5.1, modulationIndex: 16,
    resonance: 4000, octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.3, release: 0.1 }
  }).connect(reverb);
  ride.volume.value = -22;

  // Swing ride: beats 1, 2 triplet-late, 3, 4 triplet-late
  const swingOffset = q * 0.67; // triplet-swing "ah"
  for (let i = 0; i < 4; i++) {
    ride.triggerAttackRelease('8n', i * bar);
    ride.triggerAttackRelease('8n', i * bar + swingOffset);
    ride.triggerAttackRelease('8n', i * bar + q * 2);
    ride.triggerAttackRelease('8n', i * bar + q * 2 + swingOffset);
  }
}
```

## Instrument Configuration

```js
// Jazz piano — triangle wave (mellow, not harsh), moderate decay
const piano = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 1.2 }
});

// Upright bass feel — pure sine, tight decay, no sustain tail
const bass = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.08, sustain: 0.55, release: 0.15 }
});

// Ride cymbal — low frequency MetalSynth, long decay
const ride = new Tone.MetalSynth({
  frequency: 250, harmonicity: 5.1, modulationIndex: 16,
  resonance: 4000, octaves: 1.5,
  envelope: { attack: 0.001, decay: 0.3, release: 0.1 }
});

// Brush snare — bandpass-filtered white noise
const snare = new Tone.NoiseSynth({
  noise: { type: 'white' },
  envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 }
});
const snareFilter = new Tone.Filter(2500, 'bandpass');
snare.connect(snareFilter);

// Room reverb — short, warm
const reverb = new Tone.Reverb({ decay: 1.8, wet: 0.3 }).toDestination();
```

## Composition Structure

1. **Head in (0–4s):** Piano states the changes, bass walks, ride establishes swing
2. **Melody chorus (4–8s):** Bebop-style single-note melody over the changes (arpeggiated +chromatic passing tones)
3. **Reharmonization (8–12s):** Tritone sub on the V chord (Db7 instead of G7), piano plays richer voicings
4. **Tag / turnaround:** Quick ii-V back to the top, ritardando on the final bar

## Example Variations

### 1 — Tritone substitution on V (G7 → Db7)
```js
// Replace G7 shell with Db7 shell (tritone sub)
const changes = [
  ['D3','F3','C4'],    // Dm7
  ['Db3','F3','B3'],   // Db7 (tritone sub for G7)
  ['C3','E3','B3'],    // Cmaj7
];
```

### 2 — Ballad tempo (70 BPM) with rubato melody
```js
Tone.Transport.bpm.value = 70;
// Hold each chord for 2 bars, melody uses longer note values ('2n', '1n')
```

### 3 — Vibraphone color (add shimmer on the I chord)
```js
const vibe = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 0.005, decay: 1.5, sustain: 0.2, release: 2.0 }
});
const vibeVib = new Tone.Vibrato({ frequency: 5, depth: 0.05 }).connect(reverb);
vibe.connect(vibeVib);
vibe.triggerAttackRelease(['C4','E4','G4','B4'], '2n', barStart);
```
