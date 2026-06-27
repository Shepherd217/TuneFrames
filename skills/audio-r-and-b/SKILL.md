---
name: audio-r-and-b
description: R&B / Neo-Soul — lush extended chords, smooth Rhodes, laid-back syncopated groove
---

# TuneFrames — R&B / Neo-Soul

## Genre Profile
- BPM range: 70–95 (the groove breathes; never rushed)
- Key characteristics: Extended chord voicings (min9, maj9, add9, 11ths), Rhodes/electric piano feel, laid-back beat placement (drums sit just behind the grid), syncopated bass that locks with the kick, gentle compression on everything
- Typical instruments: Salamander Grand piano (Tone.Sampler, CDN), fingered electric bass (FluidR3_GM Sampler, CDN), CR78 kick/snare/hihat (Tone.Player, CDN), synth pad underneath (PolySynth sine — kept as synth), synth melody lead (Synth triangle — kept as synth)
- CDN sources: Salamander piano at `https://tonejs.github.io/audio/salamander/`, FluidR3_GM bass at `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_bass_finger-mp3/`, CR78 drums at `https://tonejs.github.io/audio/drum-samples/CR78/`
- Requires `window.TUNEFRAMES_READY` pre-fetch pattern — see example.html
- Mood: Warm, sensual, introspective, polished — D'Angelo, H.E.R., Frank Ocean, Erykah Badu, Sade

## Core Pattern

```js
// Neo-Soul core: 85 BPM, Fm9–Dbmaj9–Ab–Eb progression
async function main() {
  await Tone.start();
  Tone.Transport.bpm.value = 85;

  const bar = Tone.Time('1n').toSeconds();
  const q   = Tone.Time('4n').toSeconds();
  const s8  = Tone.Time('8n').toSeconds();

  // ── Warm compression + reverb ─────────────────────────────────────────
  const comp  = new Tone.Compressor({ threshold: -20, ratio: 3, attack: 0.01, release: 0.2 }).toDestination();
  const reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.01, wet: 0.35 }).connect(comp);

  // ── Rhodes — extended voicings ────────────────────────────────────────
  const rhodes = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.03, decay: 0.5, sustain: 0.6, release: 2.0 }
  }).connect(reverb);
  rhodes.volume.value = -10;

  // Fm9 – Dbmaj9 – Ab – Eb (rich neo-soul changes)
  const chords = [
    ['F3','Ab3','C4','Eb4','G4'],    // Fm9
    ['Db3','F3','Ab3','C4','Eb4'],   // Dbmaj9
    ['Ab2','C3','Eb3','G3'],         // Ab maj7
    ['Eb3','G3','Bb3','D4'],         // Ebmaj7
  ];
  chords.forEach((ch, i) => rhodes.triggerAttackRelease(ch, '1n', i * bar));

  // ── Syncopated bass ───────────────────────────────────────────────────
  const bass = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.015, decay: 0.15, sustain: 0.5, release: 0.3 }
  }).connect(comp);
  bass.volume.value = -7;

  // Root on 1, then syncopated hits — lands a 16th early on beat 3
  const bassLine = [
    { note: 'F2',  time: 0 },
    { note: 'F2',  time: q * 1.75 },  // 16th before beat 3
    { note: 'Eb2', time: q * 3 },
  ];
  bassLine.forEach(({ note, time }) => bass.triggerAttackRelease(note, '8n', time));
}
```

## Instrument Configuration

```js
// Rhodes feel — triangle wave, moderate attack, long release
const rhodes = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.03, decay: 0.5, sustain: 0.6, release: 2.0 }
});

// Warm bass — sine, slightly longer attack than funk (more laid-back)
const bass = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.015, decay: 0.15, sustain: 0.5, release: 0.3 }
});

// Pad underneath — very slow attack, barely audible, adds warmth
const pad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 2.0, decay: 0.5, sustain: 0.8, release: 4.0 }
});
pad.volume.value = -22; // subtle, under everything

// Chorus on the Rhodes for that electric piano shimmer
const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.5 });
chorus.start();

// Gentle compression — glues without pumping
const comp = new Tone.Compressor({ threshold: -20, ratio: 3, attack: 0.01, release: 0.2 });

// Chain: rhodes → chorus → reverb → comp → destination
const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.35 });
rhodes.connect(chorus);
chorus.connect(reverb);
reverb.connect(comp);
comp.toDestination();
```

## Composition Structure

1. **Intro (0–3s):** Rhodes alone with pad underneath — establish the lush harmonic world
2. **Bass enters (3–6s):** Syncopated bass locks with the root, still no drums
3. **Drums drop (6–9s):** Soft kick on 1 and 3, snare on 2 and 4, 8th hats — laid-back, never aggressive
4. **Melody/hook (9–12s):** High Rhodes or separate synth carries a smooth melodic phrase
5. **Outro:** Strip back to Rhodes + pad, let the chord voicings breathe and decay

## Example Variations

### 1 — D'Angelo "Voodoo" feel (heavy laid-back drums)
```js
// Drums sit 20ms behind the grid — schedule everything slightly late
const LAG = 0.02; // seconds
kick.triggerAttackRelease('C1', '8n', 0 + LAG);
snare.triggerAttackRelease('8n', q + LAG);
```

### 2 — Sade-style sparse ballad (60 BPM, less is more)
```js
Tone.Transport.bpm.value = 60;
// Just Rhodes + bass, no drums, add a gentle delay on the melody
const delay = new Tone.FeedbackDelay({ delayTime: '4n', feedback: 0.2, wet: 0.25 }).connect(reverb);
```

### 3 — Neo-soul key change (drop a half-step on bar 3)
```js
// Modulate from Fm to Em for bar 3 — creates emotional lift/tension
const chordsWithMod = [
  ['F3','Ab3','C4','Eb4','G4'],   // Fm9
  ['Db3','F3','Ab3','C4','Eb4'],  // Dbmaj9
  ['E3','G3','B3','D4','F#4'],    // Em9 (half-step down = brighter surprise)
  ['C3','E3','G3','B3'],          // Cmaj7
];
```
