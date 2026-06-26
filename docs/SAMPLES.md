# Sample Packs Reference

TuneFrames compositions load samples from public CDNs. This document covers every supported pack: CDN URLs, complete note maps, and working HTML compositions.

---

## TUNEFRAMES_READY Pattern

render.js awaits `window.TUNEFRAMES_READY` before calling `Tone.Offline()`. Set it to a Promise that resolves only after all sample buffers are ready.

### Pattern A — gleitz CDN (drums, piano, bass, strings)

Create the Sampler at the top level of the script (before `main()`), then assign `Tone.loaded()` to `window.TUNEFRAMES_READY` immediately after. `Tone.loaded()` returns a Promise that resolves when all URLs registered with Tone.js are fully decoded.

```html
<script>
  const sampler = new Tone.Sampler({
    urls: { 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/...',
  }).toDestination();
  window.TUNEFRAMES_READY = Tone.loaded();

  async function main() {
    await Tone.start();
    await window.TUNEFRAMES_READY;
    // schedule notes here
  }
  main();
</script>
```

### Pattern B — Salamander (electric-piano)

Fetch each sample as an `ArrayBuffer`, decode it in an online `AudioContext`, and store the resulting `AudioBuffer` on `window`. Inside `main()`, wrap each stored buffer with `new Tone.ToneAudioBuffer(audioBuffer)` before passing it to `Tone.Sampler`.

Why this matters: `AudioBuffer` objects decoded in an online context are valid cross-context (Web Audio API spec §6.1) and work correctly inside `Tone.Offline()`. Using `Tone.loaded()` inside `Tone.Offline()` fails silently — it checks a download list that is empty when called, causing a race condition that drops all samples.

```html
<script>
  const FILES = {
    'A0':'A0.mp3', 'C1':'C1.mp3', 'F#1':'Fs1.mp3', 'A1':'A1.mp3',
    /* ... all 20 entries ... */
  };
  const ctx = new AudioContext();
  window.TUNEFRAMES_READY = (async () => {
    window._sal = {};
    await Promise.all(Object.entries(FILES).map(async ([note, file]) => {
      try {
        const ab = await (await fetch('https://tonejs.github.io/audio/salamander/' + file)).arrayBuffer();
        window._sal[note] = await ctx.decodeAudioData(ab);
      } catch (_) {}
    }));
  })();

  async function main() {
    await Tone.start();
    // Build ToneAudioBuffer wrappers inside main():
    const urls = {};
    for (const [note, buf] of Object.entries(window._sal || {})) {
      urls[note] = new Tone.ToneAudioBuffer(buf);
    }
    const piano = new Tone.Sampler({ urls }).toDestination();
    // schedule notes here
  }
  main();
</script>
```

---

## drums

**CDN:** gleitz/dave4mpls fork — FluidR3_GM soundfont with General MIDI drum map

**Base URL:** `https://dave4mpls.github.io/midi-js-soundfonts-with-drums/FluidR3_GM/drums-mp3/`

**Filename convention:** sharps use `s` suffix (`Fs2.mp3` for F#2); flats use `b` (`Bb2.mp3`, `Db3.mp3`).

### Tone.Sampler urls object

```javascript
urls: {
  'C2': 'C2.mp3',    // Kick drum
  'D2': 'D2.mp3',    // Snare
  'F#2': 'Fs2.mp3',  // Hi-hat (closed)
  'Bb2': 'Bb2.mp3',  // Hi-hat (open)
  'Db3': 'Db3.mp3',  // Crash cymbal
  'Eb3': 'Eb3.mp3',  // Ride cymbal
}
```

### Working HTML example

```html
<!DOCTYPE html>
<html>
<head>
  <title>TuneFrames — Drums</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":90,"duration":"12s"}</div>
  <script>
    const BASE = 'https://dave4mpls.github.io/midi-js-soundfonts-with-drums/FluidR3_GM/drums-mp3/';
    const drums = new Tone.Sampler({
      urls: {
        'C2': 'C2.mp3',
        'D2': 'D2.mp3',
        'F#2': 'Fs2.mp3',
        'Bb2': 'Bb2.mp3',
        'Db3': 'Db3.mp3',
        'Eb3': 'Eb3.mp3',
      },
      baseUrl: BASE,
    }).toDestination();
    window.TUNEFRAMES_READY = Tone.loaded();

    async function main() {
      await Tone.start();
      Tone.Transport.bpm.value = 90;
      await window.TUNEFRAMES_READY;

      const q = Tone.Time('4n').toSeconds();
      const e = Tone.Time('8n').toSeconds();

      for (let bar = 0; bar < 4; bar++) {
        const b = bar * 4 * q;
        if (bar === 0) drums.triggerAttackRelease('Db3', '4n', b, 0.7);
        // kick on beats 1 and 3
        drums.triggerAttackRelease('C2', '8n', b, 0.9);
        drums.triggerAttackRelease('C2', '8n', b + 2 * q, 0.85);
        // snare on beats 2 and 4
        drums.triggerAttackRelease('D2', '8n', b + q, 0.8);
        drums.triggerAttackRelease('D2', '8n', b + 3 * q, 0.8);
        // closed hi-hat on every 8th note
        for (let i = 0; i < 8; i++) {
          drums.triggerAttackRelease('F#2', '16n', b + i * e, i % 2 === 0 ? 0.6 : 0.4);
        }
        // open hat on the and-of-4
        drums.triggerAttackRelease('Bb2', '8n', b + 3 * q + e, 0.5);
      }
    }

    main();
  </script>
</body>
</html>
```

---

## piano

**CDN:** gleitz MusyngKite — `acoustic_grand_piano`

**Base URL:** `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_grand_piano-mp3/`

**Filename convention:** flat notation only (`Ab4.mp3`, not `G#4.mp3`). All 88 notes (A0–C8) are available. Tone.Sampler accepts either enharmonic spelling as a key.

### Tone.Sampler urls object

Every minor third across the piano range, in flat notation:

```javascript
urls: {
  'A0':'A0.mp3', 'C1':'C1.mp3', 'Eb1':'Eb1.mp3', 'Gb1':'Gb1.mp3',
  'A1':'A1.mp3', 'C2':'C2.mp3', 'Eb2':'Eb2.mp3', 'Gb2':'Gb2.mp3',
  'A2':'A2.mp3', 'C3':'C3.mp3', 'Eb3':'Eb3.mp3', 'Gb3':'Gb3.mp3',
  'A3':'A3.mp3', 'C4':'C4.mp3', 'Eb4':'Eb4.mp3', 'Gb4':'Gb4.mp3',
  'A4':'A4.mp3', 'C5':'C5.mp3', 'Eb5':'Eb5.mp3', 'Gb5':'Gb5.mp3',
  'A5':'A5.mp3', 'C6':'C6.mp3', 'Eb6':'Eb6.mp3', 'Gb6':'Gb6.mp3',
  'A6':'A6.mp3', 'C7':'C7.mp3', 'Eb7':'Eb7.mp3', 'Gb7':'Gb7.mp3',
  'A7':'A7.mp3', 'C8':'C8.mp3',
}
```

### Working HTML example

```html
<!DOCTYPE html>
<html>
<head>
  <title>TuneFrames — Acoustic Piano</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":100,"duration":"12s"}</div>
  <script>
    const GLEITZ_PIANO = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_grand_piano-mp3/';
    const piano = new Tone.Sampler({
      urls: {
        'A0':'A0.mp3', 'C1':'C1.mp3', 'Eb1':'Eb1.mp3', 'Gb1':'Gb1.mp3',
        'A1':'A1.mp3', 'C2':'C2.mp3', 'Eb2':'Eb2.mp3', 'Gb2':'Gb2.mp3',
        'A2':'A2.mp3', 'C3':'C3.mp3', 'Eb3':'Eb3.mp3', 'Gb3':'Gb3.mp3',
        'A3':'A3.mp3', 'C4':'C4.mp3', 'Eb4':'Eb4.mp3', 'Gb4':'Gb4.mp3',
        'A4':'A4.mp3', 'C5':'C5.mp3', 'Eb5':'Eb5.mp3', 'Gb5':'Gb5.mp3',
      },
      baseUrl: GLEITZ_PIANO,
    }).toDestination();
    window.TUNEFRAMES_READY = Tone.loaded();

    async function main() {
      await Tone.start();
      Tone.Transport.bpm.value = 100;
      await window.TUNEFRAMES_READY;

      const q = Tone.Time('4n').toSeconds();
      const e = Tone.Time('8n').toSeconds();

      // C major chord progression: C - Am - F - G, two bars each
      const chords = [
        { notes: ['C3','E3','G3','C4'], root: 'C2' },
        { notes: ['A2','C3','E3','A3'], root: 'A1' },
        { notes: ['F2','A2','C3','F3'], root: 'F1' },
        { notes: ['G2','B2','D3','G3'], root: 'G1' },
      ];

      chords.forEach(({ notes, root }, i) => {
        const t = i * 2 * q * 4; // 2 bars per chord at 100 BPM
        // bass note
        piano.triggerAttackRelease(root, '2n', t, 0.7);
        // chord voicing — arpeggiated slightly
        notes.forEach((n, j) => {
          piano.triggerAttackRelease(n, '1n', t + j * 0.03, 0.65);
        });
      });

      // Simple melody over the top
      const melody = [
        { t: 0,            n: 'E5', d: '4n' },
        { t: q,            n: 'D5', d: '8n' },
        { t: q + e,        n: 'C5', d: '4n.' },
        { t: 2 * q * 4,    n: 'A4', d: '4n' },
        { t: 2 * q * 4 + q,n: 'C5', d: '2n' },
        { t: 4 * q * 4,    n: 'F5', d: '4n' },
        { t: 4 * q * 4 + q,n: 'E5', d: '8n' },
        { t: 4 * q * 4 + q + e, n: 'D5', d: '4n.' },
        { t: 6 * q * 4,    n: 'G5', d: '4n' },
        { t: 6 * q * 4 + q,n: 'E5', d: '2n.' },
      ];
      melody.forEach(({ t, n, d }) => piano.triggerAttackRelease(n, d, t, 0.72));
    }

    main();
  </script>
</body>
</html>
```

---

## electric-piano

**CDN:** Tone.js Salamander Grand Piano

**Base URL:** `https://tonejs.github.io/audio/salamander/`

**Filename convention:** sharps use `s` (`Fs4.mp3` for F#4). Natural notes use their standard name (`A4.mp3`).

**Required pattern:** Use Pattern B (ArrayBuffer pre-fetch) — do not use `baseUrl` with this CDN inside `Tone.Offline()`.

### 20 sample files

| Tone.Sampler key | Filename |
|---|---|
| A0 | A0.mp3 |
| C1 | C1.mp3 |
| F#1 | Fs1.mp3 |
| A1 | A1.mp3 |
| C2 | C2.mp3 |
| F#2 | Fs2.mp3 |
| A2 | A2.mp3 |
| C3 | C3.mp3 |
| F#3 | Fs3.mp3 |
| A3 | A3.mp3 |
| C4 | C4.mp3 |
| F#4 | Fs4.mp3 |
| A4 | A4.mp3 |
| C5 | C5.mp3 |
| F#5 | Fs5.mp3 |
| A5 | A5.mp3 |
| C6 | C6.mp3 |
| F#6 | Fs6.mp3 |
| A6 | A6.mp3 |
| C7 | C7.mp3 |

### Tone.Sampler urls object

```javascript
urls: {
  'A0':'A0.mp3', 'C1':'C1.mp3', 'F#1':'Fs1.mp3', 'A1':'A1.mp3',
  'C2':'C2.mp3', 'F#2':'Fs2.mp3','A2':'A2.mp3',  'C3':'C3.mp3',
  'F#3':'Fs3.mp3','A3':'A3.mp3', 'C4':'C4.mp3',  'F#4':'Fs4.mp3',
  'A4':'A4.mp3',  'C5':'C5.mp3', 'F#5':'Fs5.mp3','A5':'A5.mp3',
  'C6':'C6.mp3',  'F#6':'Fs6.mp3','A6':'A6.mp3', 'C7':'C7.mp3',
}
```

Note: the keys use `#` (standard note names); filenames use `s`. These are different and both are needed.

### Working HTML example

```html
<!DOCTYPE html>
<html>
<head>
  <title>TuneFrames — Electric Piano (Salamander)</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":80,"duration":"16s"}</div>
  <script>
    const SAL_BASE = 'https://tonejs.github.io/audio/salamander/';
    const SAL_FILES = {
      'A0':'A0.mp3', 'C1':'C1.mp3', 'F#1':'Fs1.mp3', 'A1':'A1.mp3',
      'C2':'C2.mp3', 'F#2':'Fs2.mp3','A2':'A2.mp3',  'C3':'C3.mp3',
      'F#3':'Fs3.mp3','A3':'A3.mp3', 'C4':'C4.mp3',  'F#4':'Fs4.mp3',
      'A4':'A4.mp3',  'C5':'C5.mp3', 'F#5':'Fs5.mp3','A5':'A5.mp3',
      'C6':'C6.mp3',  'F#6':'Fs6.mp3','A6':'A6.mp3', 'C7':'C7.mp3',
    };

    // Pre-fetch all samples BEFORE render.js calls Tone.Offline().
    // AudioBuffer decoded in an online AudioContext is valid inside the offline render.
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    window.TUNEFRAMES_READY = (async () => {
      window._sal = {};
      await Promise.all(Object.entries(SAL_FILES).map(async ([note, file]) => {
        try {
          const ab = await (await fetch(SAL_BASE + file)).arrayBuffer();
          window._sal[note] = await ctx.decodeAudioData(ab);
        } catch (_) {}
      }));
    })();

    async function main() {
      await Tone.start();
      Tone.Transport.bpm.value = 80;

      // Wrap pre-fetched AudioBuffers as ToneAudioBuffers
      const urls = {};
      for (const [note, buf] of Object.entries(window._sal || {})) {
        urls[note] = new Tone.ToneAudioBuffer(buf);
      }

      const hasSamples = Object.keys(urls).length > 0;
      let ep;
      if (hasSamples) {
        ep = new Tone.Sampler({ urls, attack: 0.01, release: 2.0 }).toDestination();
        ep.volume.value = -6;
      } else {
        // FM fallback if CDN is unreachable
        ep = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1, modulationIndex: 2.5,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.9, sustain: 0, release: 2.2 },
          modulation: { type: 'sine' },
          modulationEnvelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.1 },
        }).toDestination();
        ep.volume.value = -10;
      }

      const q = Tone.Time('4n').toSeconds();
      const bar = Tone.Time('1m').toSeconds();

      // Am - F - C - G progression, two passes
      const prog = [
        { chord: ['A3','C4','E4'], root: 'A2' },
        { chord: ['F3','A3','C4'], root: 'F2' },
        { chord: ['C3','E3','G3'], root: 'C2' },
        { chord: ['G3','B3','D4'], root: 'G2' },
      ];

      for (let pass = 0; pass < 2; pass++) {
        prog.forEach(({ chord, root }, i) => {
          const t = (pass * 4 + i) * bar;
          ep.triggerAttackRelease(root, '2n', t, 0.55);
          ep.triggerAttackRelease(chord, '1n', t, 0.60);
          // off-beat stab on bar 2 and 4
          if (i % 2 === 1) {
            ep.triggerAttackRelease(chord, '8n', t + 2 * q + q * 0.5, 0.45);
          }
        });
      }
    }

    main();
  </script>
</body>
</html>
```

---

## bass

**CDN:** gleitz MusyngKite — `electric_bass_finger`

**Base URL:** `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/electric_bass_finger-mp3/`

**Filename convention:** flat notation only (`Bb2.mp3`, not `A#2.mp3`). All 88 notes (A0–C8) are available.

### Tone.Sampler urls object

Open-string anchors plus coverage to the 4th fret position, spaced a 4th apart:

```javascript
urls: {
  'E1':'E1.mp3', 'A1':'A1.mp3', 'D2':'D2.mp3', 'G2':'G2.mp3',
  'B2':'B2.mp3', 'E3':'E3.mp3', 'A3':'A3.mp3', 'D4':'D4.mp3',
}
```

### Working HTML example

```html
<!DOCTYPE html>
<html>
<head>
  <title>TuneFrames — Electric Bass</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":90,"duration":"12s"}</div>
  <script>
    const GLEITZ_BASS = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/electric_bass_finger-mp3/';
    const bass = new Tone.Sampler({
      urls: {
        'E1':'E1.mp3', 'A1':'A1.mp3', 'D2':'D2.mp3', 'G2':'G2.mp3',
        'B2':'B2.mp3', 'E3':'E3.mp3', 'A3':'A3.mp3', 'D4':'D4.mp3',
      },
      baseUrl: GLEITZ_BASS,
    }).connect(new Tone.Compressor({ threshold: -18, ratio: 4 }).toDestination());
    window.TUNEFRAMES_READY = Tone.loaded();

    async function main() {
      await Tone.start();
      Tone.Transport.bpm.value = 90;
      await window.TUNEFRAMES_READY;

      const q = Tone.Time('4n').toSeconds();
      const e = Tone.Time('8n').toSeconds();
      const s = Tone.Time('16n').toSeconds();

      // Roots for Am - F - C - G
      const roots = ['A1', 'F1', 'C2', 'G1'];

      for (let bar = 0; bar < 4; bar++) {
        const b = bar * 4 * q;
        const root = roots[bar];
        // syncopated bass pattern
        bass.triggerAttackRelease(root, '8n',  b,              0.85);
        bass.triggerAttackRelease(root, '8n',  b + q + s,      0.70);
        bass.triggerAttackRelease(root, '16n', b + 2 * q,      0.78);
        bass.triggerAttackRelease(root, '8n',  b + 2 * q + e,  0.65);
        bass.triggerAttackRelease(root, '8n',  b + 3 * q + s,  0.75);
      }
    }

    main();
  </script>
</body>
</html>
```

---

## strings

**CDN:** gleitz MusyngKite — `string_ensemble_1`

**Base URL:** `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/string_ensemble_1-mp3/`

**Filename convention:** flat notation only (`Ab4.mp3`, not `G#4.mp3`). All 88 notes (A0–C8) are available.

### Tone.Sampler urls object

Minor thirds across the orchestral strings range (C3–Bb5):

```javascript
urls: {
  'C3':'C3.mp3', 'Eb3':'Eb3.mp3', 'Gb3':'Gb3.mp3', 'Bb3':'Bb3.mp3',
  'C4':'C4.mp3', 'Eb4':'Eb4.mp3', 'Gb4':'Gb4.mp3', 'Bb4':'Bb4.mp3',
  'C5':'C5.mp3', 'Eb5':'Eb5.mp3', 'Gb5':'Gb5.mp3', 'Bb5':'Bb5.mp3',
}
```

### Working HTML example

```html
<!DOCTYPE html>
<html>
<head>
  <title>TuneFrames — Strings</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
  <div id="tuneframes" style="display:none">{"bpm":60,"duration":"20s"}</div>
  <script>
    const GLEITZ_STRINGS = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/string_ensemble_1-mp3/';
    const strings = new Tone.Sampler({
      urls: {
        'C3':'C3.mp3', 'Eb3':'Eb3.mp3', 'Gb3':'Gb3.mp3', 'Bb3':'Bb3.mp3',
        'C4':'C4.mp3', 'Eb4':'Eb4.mp3', 'Gb4':'Gb4.mp3', 'Bb4':'Bb4.mp3',
        'C5':'C5.mp3', 'Eb5':'Eb5.mp3', 'Gb5':'Gb5.mp3', 'Bb5':'Bb5.mp3',
      },
      baseUrl: GLEITZ_STRINGS,
      attack: 0.3,
      release: 3.0,
    }).connect(new Tone.Filter({ frequency: 6000, type: 'lowpass' }).toDestination());
    window.TUNEFRAMES_READY = Tone.loaded();

    async function main() {
      await Tone.start();
      Tone.Transport.bpm.value = 60;
      await window.TUNEFRAMES_READY;

      const bar = Tone.Time('1m').toSeconds();

      // Slow string pads: Dm - Bb - F - C
      const prog = [
        { chord: ['D3','F3','A3','D4'],  mel: 'F4'  },
        { chord: ['Bb2','D3','F3','Bb3'], mel: 'D4'  },
        { chord: ['F2','A2','C3','F3'],   mel: 'C4'  },
        { chord: ['C3','E3','G3','C4'],   mel: 'E4'  },
      ];

      // Two full passes of the progression
      for (let pass = 0; pass < 2; pass++) {
        prog.forEach(({ chord, mel }, i) => {
          const t = (pass * 4 + i) * bar;
          strings.triggerAttackRelease(chord, '1n', t, 0.55);
          // melody note enters slightly after the chord
          strings.triggerAttackRelease(mel, '1n', t + 0.25, 0.45);
        });
      }
    }

    main();
  </script>
</body>
</html>
```
