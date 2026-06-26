# How TuneFrames Works

Technical reference for contributors. Assumes familiarity with Web Audio API, Tone.js, and Node.js.

---

## 1. Pipeline Overview

```
HTML composition
  └─ parse metadata (BPM, duration)
       └─ Playwright launch (headless Chromium)
            └─ HELPER_SCRIPT inject (before page scripts)
                 └─ Tone.Offline() render → Float32Array
                      └─ audioBufferToWav() → WAV bytes
                           └─ page.exposeFunction writeFile → disk
                                └─ FFmpeg spawn → MP3
```

Five stages:

1. **Parse** — `cli.js` reads the HTML file, extracts `<div id="tuneframes">` JSON for BPM and duration (in seconds).
2. **Launch** — `render.js` opens a Playwright page, sets viewport, and injects the helper script before the composition's own scripts run.
3. **Inject** — the helper script patches `window.Tone` via a Proxy and registers the `TUNEFRAMES_READY` handler.
4. **Render** — the composition calls `Tone.Offline()` for the requested duration. All scheduled audio is rendered synchronously to a Float32Array in the Chromium process.
5. **Convert** — the Float32Array is written as a PCM WAV via the exposed Node callback, then FFmpeg converts WAV → MP3 via `child_process.spawn`. The WAV intermediate is deleted.

---

## 2. HELPER_SCRIPT Injection

The helper script is injected via `page.addScriptTag({ content: ... })` before any other scripts on the page load. It installs three things:

**`audioBufferToWav(audioBuffer)`** — converts an `AudioBuffer` returned by `Tone.Offline()` to a `Uint8Array` containing a valid WAV file (RIFF header, PCM 16-bit signed little-endian, 44100 Hz). Handles multi-channel interleaving. Clamped to `[-1, 1]` before quantization to avoid clipping artefacts from values slightly outside range.

**`_patchToneWorklets()`** — installs a `Proxy` on `window.Tone`. The proxy's `get` trap intercepts class lookups for AudioWorklet-backed effects (`Reverb`, `Freeverb`, `BitCrusher`, `Chebyshev`) and replaces them with no-op stubs that return silent `Tone.Volume` nodes. This runs once when the helper script loads, before composition code can reference those classes.

**`TUNEFRAMES_READY` handler** — `render.js` waits for `window.TUNEFRAMES_READY` to resolve before invoking `Tone.Offline()`. If the composition sets `window.TUNEFRAMES_READY = new Promise(...)`, the render pipeline awaits it. This is the mechanism that allows compositions to pre-fetch CDN samples before the offline context activates.

---

## 3. The AudioWorklet Problem

Several Tone.js effects — `Reverb`, `Freeverb`, `BitCrusher`, `Chebyshev` — use `AudioWorkletNode` internally. Loading an AudioWorklet module requires fetching a JavaScript file over the network and registering it with the `AudioContext`. In a headless Chromium environment running `Tone.Offline()` (which creates an `OfflineAudioContext`), this module loading fails silently or throws, causing the effect to produce no output or hang the render.

**The fix**: stub those classes out before composition code loads them. The Proxy intercepts any property access on `window.Tone` matching those class names and returns a constructor that produces a silent passthrough node (`Tone.Volume` at `-Infinity` dB with no connections, or simply a `Tone.Gain` at 0).

**Why direct property assignment fails**: In the Tone.js bundle produced by Rollup, exports are live bindings implemented as `Object.defineProperty` accessors — they have `get` but no `set`, and `writable: false`, `configurable: false`. Attempting `window.Tone.Reverb = MyStub` silently fails in non-strict code (the assignment is ignored). Attempting `Object.defineProperty(window.Tone, 'Reverb', { value: MyStub })` throws a `TypeError: Cannot redefine property` invariant violation because the existing descriptor is non-configurable.

**Why a Proxy works**: `new Proxy(window.Tone, { get(target, key) { ... } })` wraps the object without touching its property descriptors. The `get` trap fires on every property read. We replace `window.Tone` with the proxy; the original Tone object remains unmodified. Composition code that writes `const reverb = new Tone.Reverb(...)` hits the proxy's get trap on `Reverb` and receives the stub constructor.

---

## 4. TUNEFRAMES_READY Pattern

`render.js` evaluates this in the page after scripts have loaded:

```js
if (window.TUNEFRAMES_READY instanceof Promise) {
  await window.TUNEFRAMES_READY;
}
// then: await Tone.Offline(() => { ... }, duration, 2, 44100)
```

Compositions that need to pre-fetch audio samples (e.g., a Sampler loading piano samples from a CDN) set:

```js
window.TUNEFRAMES_READY = new Promise(async (resolve) => {
  await sampler.loaded();
  resolve();
});
```

**Why `Tone.loaded()` inside `Tone.Offline()` fails**: `Tone.loaded()` resolves when `ToneAudioBuffer._downloads` is empty. Samplers register their pending downloads when `new Tone.Sampler({ ... })` runs. Inside an `Offline` callback, the `OfflineAudioContext` is a new, isolated context — any `Tone.Sampler` instantiated there registers to a different buffer registry. Downloads registered before `Tone.Offline()` was called may have already resolved, leaving `_downloads` empty, causing `Tone.loaded()` to resolve immediately even if the actual audio data hasn't been decoded in the new context.

The `TUNEFRAMES_READY` pattern sidesteps this: sample loading happens in the page's main `AudioContext` before `Tone.Offline()` is invoked. The pre-fetched buffers are then handed to the offline context (see section 5).

---

## 5. Cross-Context AudioBuffer

Web Audio API spec §6.1 explicitly permits an `AudioBuffer` decoded in one `AudioContext` to be transferred to and used in another. TuneFrames exploits this for sample pre-fetching:

1. Outside `Tone.Offline()`: decode the audio data in the page's default online `AudioContext`:
   ```js
   const response = await fetch(url);
   const arrayBuffer = await response.arrayBuffer();
   const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
   ```
2. Inside the `Tone.Offline()` callback: wrap the decoded buffer with Tone's buffer class:
   ```js
   const toneBuffer = new Tone.ToneAudioBuffer(audioBuffer);
   sampler.add('C4', toneBuffer);
   ```

The `ToneAudioBuffer` wrapper holds a reference to the raw `AudioBuffer`. When the Sampler schedules playback inside the offline context, it reads samples from this buffer directly — no network fetch or decode step occurs inside `Tone.Offline()`.

---

## 6. StateTimeline Ordering

Tone.js maintains a `StateTimeline` per instrument to track attack/release state transitions. The timeline enforces a strict invariant: events must be inserted in non-decreasing time order. Inserting an event at time `T` when the most recent event is at time `T' > T` throws:

```
Error: The time must be greater than or equal to the last scheduled time
```

This surfaces in compositions that build note arrays algorithmically and call `triggerAttackRelease` in the order the notes were generated rather than chronological order.

**Fix**: collect all `{ time, note, duration }` objects into an array, sort ascending by `time`, then schedule them in sorted order:

```js
notes.sort((a, b) => Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds());
notes.forEach(({ time, note, duration }) => {
  synth.triggerAttackRelease(note, duration, time);
});
```

This must happen inside the `Tone.Offline()` callback, where all times are relative to the offline context's clock.

---

## 7. Binary Handoff

`page.evaluate()` returns values through Chrome DevTools Protocol (CDP) JSON serialization. CDP serializes `ArrayBuffer` as base64, but the serialized string is subject to a message size limit (approximately 100 MB after base64 encoding for a 10-second stereo WAV at 44100 Hz / 16-bit ≈ 3.4 MB raw ≈ 4.5 MB base64 — within limit, but larger compositions or higher bit depths can exceed it and the result is silently truncated).

**Fix**: use `page.exposeFunction` to hand a Node.js callback directly into the browser context:

```js
// render.js (Node side)
await page.exposeFunction('writeFile', (data) => {
  fs.writeFileSync(wavPath, Buffer.from(data));
});
```

```js
// Inside page evaluate (browser side)
const uint8Array = audioBufferToWav(audioBuffer);
await window.writeFile(Array.from(uint8Array));
```

The browser calls `window.writeFile` with a plain JS array (JSON-serializable, any size). The exposed Node function receives it, converts to a `Buffer`, and writes to disk. No CDP binary transport, no size limit.

---

## 8. MetalSynth Patch

`Tone.MetalSynth` creates internal envelope state events during initialization and during `triggerAttack`. These internal events are sometimes inserted into the `StateTimeline` out of chronological order relative to events scheduled by the composition, triggering the ordering invariant described in section 6.

Inside the `Tone.Offline()` callback, `MetalSynth`'s envelope timelines are patched to suppress ordering errors:

```js
const metal = new Tone.MetalSynth();
// Silence StateTimeline ordering assertions on internal envelopes
['envelope', 'octaves'].forEach((key) => {
  if (metal[key] && metal[key]._timeline) {
    metal[key]._timeline._strictMode = false;
  }
});
```

This is a targeted workaround, not a general policy. Only `MetalSynth`'s own internal timelines are relaxed; composition-level scheduling still follows strict ordering.

---

## 9. FFmpeg Conversion

After `writeFile` writes the WAV to disk, `render.js` spawns FFmpeg:

```js
child_process.spawn('ffmpeg', [
  '-y',            // overwrite output without prompting
  '-i', wavPath,   // input: PCM WAV
  '-codec:a', 'libmp3lame',
  '-qscale:a', '2',  // VBR quality 2 (~190 kbps)
  mp3Path
])
```

The WAV file is 16-bit signed little-endian PCM at 44100 Hz, stereo (2 channels). `Tone.Offline()` returns a Float32Array per channel in the range `[-1.0, 1.0]`. `audioBufferToWav()` interleaves channels and quantizes to `Int16` by multiplying by `32767` and clamping.

After FFmpeg exits with code 0, the WAV intermediate is deleted with `fs.unlinkSync`. On non-zero exit, the error is surfaced and the WAV is preserved for debugging.

FFmpeg is invoked as a subprocess (not a library binding) to avoid native module compilation requirements at install time. The path is resolved via `which ffmpeg` / `where ffmpeg` at startup; if FFmpeg is not found, the CLI prints a clear installation message and exits before attempting to render.
