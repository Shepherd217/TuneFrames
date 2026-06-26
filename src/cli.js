#!/usr/bin/env node
/**
 * TuneFrames CLI
 *
 * Commands:
 *   tuneframes render <file.html> [--output track.mp3]
 *   tuneframes init <project-name>
 *   tuneframes preview <file.html>
 *   tuneframes validate <file.html>
 *   tuneframes add <preset-name>
 */

const { render } = require('./render');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PRESETS = ['drums-lofi', 'reverb-warm', 'chord-progression', 'bass-saw', 'lead-piano'];

async function main() {
  const [,, cmd, ...args] = process.argv;

  switch (cmd) {
    case 'render': {
      const inputFile = args[0];
      const equalsArg = args.find(a => a.startsWith('--output='));
      const separateIdx = args.indexOf('--output');
      const formatIdx = args.indexOf('--format');
      const outputFile = equalsArg
        ? equalsArg.split('=')[1]
        : separateIdx !== -1 && args[separateIdx + 1] && !args[separateIdx + 1].startsWith('--')
        ? args[separateIdx + 1]
        : inputFile.replace(/\.html$/, '.mp3');
      const outputFormat = formatIdx !== -1 && args[formatIdx + 1] ? args[formatIdx + 1] : 'mp3';

      const timeoutEqArg = args.find(a => a.startsWith('--timeout='));
      const timeoutIdx = args.indexOf('--timeout');
      const timeoutSec = timeoutEqArg
        ? parseInt(timeoutEqArg.split('=')[1], 10)
        : timeoutIdx !== -1 && args[timeoutIdx + 1] && !args[timeoutIdx + 1].startsWith('--')
        ? parseInt(args[timeoutIdx + 1], 10)
        : 60;
      const timeoutMs = timeoutSec * 1000;

      if (!inputFile) {
        console.error('Usage: tuneframes render <file.html> [--output=track.mp3] [--format wav] [--timeout 60]');
        process.exit(1);
      }

      if (!fs.existsSync(inputFile)) {
        console.error(`File not found: ${inputFile}`);
        process.exit(1);
      }

      console.log(`Rendering ${inputFile} → ${outputFile}`);
      const result = await render(inputFile, outputFile, outputFormat, timeoutMs);
      console.log(`Done. Output: ${result.output}`);
      break;
    }

    case 'init': {
      const [projectName] = args;
      if (!projectName) {
        console.error('Usage: tuneframes init <project-name>');
        process.exit(1);
      }

      const dir = path.join(process.cwd(), projectName);
      fs.mkdirSync(dir, { recursive: true });

      const example = fs.readFileSync(
        path.join(__dirname, '../examples/example-lofi.html'), 'utf8'
      );
      fs.writeFileSync(path.join(dir, 'composition.html'), example);
      fs.writeFileSync(path.join(dir, 'README.md'),
        `# ${projectName}\n\nRun: tuneframes render composition.html\n`);

      console.log(`Initialized ${projectName}/`);
      break;
    }

    case 'preview': {
      const inputFile = args[0];
      if (!inputFile) {
        console.error('Usage: tuneframes preview <file.html>');
        process.exit(1);
      }
      const url = `file://${path.resolve(inputFile)}`;
      console.log(`Preview: ${url}`);
      if (process.platform === 'darwin') {
        spawn('open', [url]);
      } else if (process.platform === 'linux') {
        spawn('xdg-open', [url]);
      }
      break;
    }

    case 'validate': {
      const inputFile = args[0];
      if (!inputFile) {
        console.error('Usage: tuneframes validate <file.html>');
        process.exit(1);
      }
      if (!fs.existsSync(inputFile)) {
        console.error(`File not found: ${inputFile}`);
        process.exit(1);
      }

      const tmpOut = `/tmp/tuneframes-validate-${Date.now()}.mp3`;
      try {
        await render(inputFile, tmpOut);
        const stats = fs.statSync(tmpOut);
        if (stats.size < 5000) {
          console.error(`FAIL: ${inputFile} rendered to ${stats.size} bytes (< 5000)`);
          process.exit(1);
        }
        console.log(`OK: ${inputFile} — ${stats.size} bytes`);
      } finally {
        if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
      }
      break;
    }

    case 'lint': {
      const inputFile = args[0];
      if (!inputFile) {
        console.error('Usage: tuneframes lint <file.html>');
        process.exit(1);
      }
      if (!fs.existsSync(inputFile)) {
        console.error(`File not found: ${inputFile}`);
        process.exit(1);
      }

      const content = fs.readFileSync(inputFile, 'utf8');
      const errors = [];

      // Check 1: must have <div id="tuneframes">
      if (!content.includes('id="tuneframes"')) {
        errors.push('Missing <div id="tuneframes"> metadata block');
      }

      // Check 2: metadata must be valid JSON
      const metaMatch = content.match(/id="tuneframes"[^>]*>([^<]+)<\/div>/);
      if (metaMatch) {
        try {
          JSON.parse(metaMatch[1].trim());
        } catch (e) {
          errors.push(`Invalid JSON in metadata block: ${e.message}`);
        }
      }

      // Check 3: must load Tone.js
      if (!content.includes('Tone.js') && !content.includes('tone')) {
        errors.push('No Tone.js script reference found');
      }

      // Check 4: must have async function main()
      if (!content.includes('async function main()')) {
        errors.push('Missing async function main()');
      }

      // Check 5: main() should contain await Tone.start()
      if (content.includes('async function main()') && !content.includes('Tone.start()')) {
        errors.push('main() should call await Tone.start()');
      }

      if (errors.length === 0) {
        console.log(`OK: ${inputFile}`);
      } else {
        errors.forEach(e => console.error(`FAIL: ${e}`));
        process.exit(1);
      }
      break;
    }

    case 'add': {
      const [presetName] = args;
      if (!presetName) {
        console.error(`Usage: tuneframes add <preset>\nAvailable: ${PRESETS.join(', ')}`);
        process.exit(1);
      }
      if (!PRESETS.includes(presetName)) {
        console.error(`Unknown preset: "${presetName}"\nAvailable presets: ${PRESETS.join(', ')}\n\nFor CDN soundfont instruments (Tone.Sampler), run: tuneframes instruments`);
        process.exit(1);
      }

      const presetPath = path.join(__dirname, `../registry/presets/${presetName}.html`);
      const content = fs.readFileSync(presetPath, 'utf8');

      // Append to composition.html in current directory
      const compPath = path.join(process.cwd(), 'composition.html');
      if (!fs.existsSync(compPath)) {
        console.error('No composition.html found. Run tuneframes init first.');
        process.exit(1);
      }

      const existing = fs.readFileSync(compPath, 'utf8');
      const insertMarker = '</script>';
      if (existing.includes(insertMarker)) {
        const newContent = existing.replace(insertMarker, content + '\n' + insertMarker);
        fs.writeFileSync(compPath, newContent);
      } else {
        fs.appendFileSync(compPath, '\n' + content);
      }

      console.log(`Added ${presetName} to composition.html`);
      break;
    }

    case 'instruments': {
      const GLEITZ_BASE = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/{instrument}-mp3/{note}.mp3';
      const DRUMS_CDN = 'https://dave4mpls.github.io/midi-js-soundfonts-with-drums/FluidR3_GM/drums-mp3/{note}.mp3';

      console.log('gleitz CDN instruments (MusyngKite, high quality)');
      console.log(`URL pattern: ${GLEITZ_BASE}\n`);

      const categories = {
        'Piano':          ['acoustic_grand_piano','bright_acoustic_piano','electric_grand_piano','honkytonk_piano','electric_piano_1','electric_piano_2','harpsichord','clavinet'],
        'Chromatic Perc': ['celesta','glockenspiel','music_box','vibraphone','marimba','xylophone','tubular_bells','dulcimer'],
        'Organ':          ['drawbar_organ','percussive_organ','rock_organ','church_organ','reed_organ','accordion','harmonica','tango_accordion'],
        'Guitar':         ['acoustic_guitar_nylon','acoustic_guitar_steel','electric_guitar_jazz','electric_guitar_clean','electric_guitar_muted','overdriven_guitar','distortion_guitar','guitar_harmonics'],
        'Bass':           ['acoustic_bass','electric_bass_finger','electric_bass_pick','fretless_bass','slap_bass_1','slap_bass_2','synth_bass_1','synth_bass_2'],
        'Strings':        ['violin','viola','cello','contrabass','tremolo_strings','pizzicato_strings','orchestral_harp','timpani'],
        'Ensemble':       ['string_ensemble_1','string_ensemble_2','synth_strings_1','synth_strings_2','choir_aahs','voice_oohs','synth_choir','orchestra_hit'],
        'Brass':          ['trumpet','trombone','tuba','muted_trumpet','french_horn','brass_section','synth_brass_1','synth_brass_2'],
        'Reed':           ['soprano_sax','alto_sax','tenor_sax','baritone_sax','oboe','english_horn','bassoon','clarinet'],
        'Pipe':           ['piccolo','flute','recorder','pan_flute','blown_bottle','shakuhachi','whistle','ocarina'],
        'Synth Lead':     ['lead_1_square','lead_2_sawtooth','lead_3_calliope','lead_4_chiff','lead_5_charang','lead_6_voice','lead_7_fifths','lead_8_bass_and_lead'],
        'Synth Pad':      ['pad_1_new_age','pad_2_warm','pad_3_polysynth','pad_4_choir','pad_5_bowed','pad_6_metallic','pad_7_halo','pad_8_sweep'],
        'Synth FX':       ['fx_1_rain','fx_2_soundtrack','fx_3_crystal','fx_4_atmosphere','fx_5_brightness','fx_6_goblins','fx_7_echoes','fx_8_scifi'],
        'Ethnic':         ['sitar','banjo','shamisen','koto','kalimba','bagpipe','fiddle','shanai'],
        'Percussive':     ['tinkle_bell','agogo','steel_drums','woodblock','taiko_drum','melodic_tom','synth_drum','reverse_cymbal'],
        'Sound FX':       ['guitar_fret_noise','breath_noise','seashore','bird_tweet','telephone_ring','helicopter','applause','gunshot'],
      };

      for (const [cat, list] of Object.entries(categories)) {
        console.log(`${cat}:`);
        console.log('  ' + list.join('  '));
      }

      console.log('\nDrums (dave4mpls fork — standard gleitz does not include GM drums):');
      console.log(`  URL: ${DRUMS_CDN}`);
      console.log('  Trigger notes: C2=Kick  D2=Snare  Gb2=Hi-Hat(closed)  Bb2=Hi-Hat(open)  Db3=Crash  Eb3=Ride');

      console.log('\nNotes:');
      console.log('  - All 88 notes present per instrument (A0–C8), flat notation only (Ab4.mp3, not G#4.mp3)');
      console.log('  - Tone.Sampler accepts both Ab4 and G#4 as url keys — either works');
      console.log('  - Set window.TUNEFRAMES_READY = Tone.loaded() so the renderer waits for samples');
      break;
    }

    case 'install': {
      const [packName] = args;
      const DRUMS_BASE     = 'https://dave4mpls.github.io/midi-js-soundfonts-with-drums/FluidR3_GM/drums-mp3/';
      const GLEITZ_PIANO   = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_grand_piano-mp3/';
      const GLEITZ_BASS    = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/electric_bass_finger-mp3/';
      const GLEITZ_STRINGS = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/string_ensemble_1-mp3/';
      const SALAMANDER_BASE = 'https://tonejs.github.io/audio/salamander/';

      if (!packName || packName === 'list') {
        console.log('Available sample packs:');
        console.log('  drums          Standard kit (kick, snare, hat, crash) via gleitz/dave4mpls CDN');
        console.log('  piano          Acoustic grand piano via gleitz CDN (MusyngKite)');
        console.log('  electric-piano Rhodes-style Salamander samples');
        console.log('  bass           Electric bass (fingered) via gleitz CDN');
        console.log('  strings        String ensemble via gleitz CDN');
        console.log('\nRun: tuneframes install <pack>');
        break;
      }

      switch (packName) {
        case 'drums': {
          console.log('drums (gleitz/dave4mpls CDN)\n');
          console.log(`CDN base URL:\n  ${DRUMS_BASE}\n`);
          console.log('Filename convention: sharps use "s" suffix (Fs2.mp3 for F#2); flats use "b" (Bb2.mp3)\n');
          console.log('Trigger map:');
          console.log('  C2  -> Kick drum');
          console.log('  D2  -> Snare');
          console.log('  F#2 -> Hi-hat (closed)  [file: Fs2.mp3]');
          console.log('  Bb2 -> Hi-hat (open)    [file: Bb2.mp3]');
          console.log('  Db3 -> Crash            [file: Db3.mp3]');
          console.log('  Eb3 -> Ride             [file: Eb3.mp3]');
          console.log('\nCopy-paste usage:');
          console.log(`  const drums = new Tone.Sampler({`);
          console.log(`    urls: {`);
          console.log(`      'C2': 'C2.mp3', 'D2': 'D2.mp3', 'F#2': 'Fs2.mp3',`);
          console.log(`      'Bb2': 'Bb2.mp3', 'Db3': 'Db3.mp3', 'Eb3': 'Eb3.mp3',`);
          console.log(`    },`);
          console.log(`    baseUrl: '${DRUMS_BASE}',`);
          console.log(`  }).toDestination();`);
          console.log(`  window.TUNEFRAMES_READY = Tone.loaded();`);
          console.log('\nTip: Use window.TUNEFRAMES_READY = Tone.loaded() so the renderer waits for samples to load.');
          break;
        }
        case 'piano': {
          console.log('piano (gleitz CDN — MusyngKite acoustic_grand_piano)\n');
          console.log(`CDN base URL:\n  ${GLEITZ_PIANO}\n`);
          console.log('Filename convention: flat notation only (Ab4.mp3, not G#4.mp3); Tone.Sampler accepts either as keys\n');
          console.log('Copy-paste usage:');
          console.log(`  const piano = new Tone.Sampler({`);
          console.log(`    urls: {`);
          console.log(`      'A0':'A0.mp3', 'C1':'C1.mp3', 'Eb1':'Eb1.mp3', 'Gb1':'Gb1.mp3',`);
          console.log(`      'A1':'A1.mp3', 'C2':'C2.mp3', 'Eb2':'Eb2.mp3', 'Gb2':'Gb2.mp3',`);
          console.log(`      'A2':'A2.mp3', 'C3':'C3.mp3', 'Eb3':'Eb3.mp3', 'Gb3':'Gb3.mp3',`);
          console.log(`      'A3':'A3.mp3', 'C4':'C4.mp3', 'Eb4':'Eb4.mp3', 'Gb4':'Gb4.mp3',`);
          console.log(`      'A4':'A4.mp3', 'C5':'C5.mp3', 'Eb5':'Eb5.mp3', 'Gb5':'Gb5.mp3',`);
          console.log(`    },`);
          console.log(`    baseUrl: '${GLEITZ_PIANO}',`);
          console.log(`  }).toDestination();`);
          console.log(`  window.TUNEFRAMES_READY = Tone.loaded();`);
          console.log('\nTip: Use window.TUNEFRAMES_READY = Tone.loaded() so the renderer waits for samples to load.');
          break;
        }
        case 'electric-piano': {
          console.log('electric-piano (Salamander Grand Piano)\n');
          console.log(`CDN base URL:\n  ${SALAMANDER_BASE}\n`);
          console.log('Filename convention: sharps use "s" (Fs4.mp3 for F#4); 20 samples span A0 to C7\n');
          console.log('Sample filenames: A0 C1 Fs1 A1 C2 Fs2 A2 C3 Fs3 A3 C4 Fs4 A4 C5 Fs5 A5 C6 Fs6 A6 C7\n');
          console.log('Copy-paste usage (pre-fetch pattern — avoids Tone.loaded() race condition):\n');
          console.log(`  const FILES = {`);
          console.log(`    'A0':'A0.mp3', 'C1':'C1.mp3', 'F#1':'Fs1.mp3', 'A1':'A1.mp3',`);
          console.log(`    'C2':'C2.mp3', 'F#2':'Fs2.mp3','A2':'A2.mp3',  'C3':'C3.mp3',`);
          console.log(`    'F#3':'Fs3.mp3','A3':'A3.mp3', 'C4':'C4.mp3',  'F#4':'Fs4.mp3',`);
          console.log(`    'A4':'A4.mp3',  'C5':'C5.mp3', 'F#5':'Fs5.mp3','A5':'A5.mp3',`);
          console.log(`    'C6':'C6.mp3',  'F#6':'Fs6.mp3','A6':'A6.mp3', 'C7':'C7.mp3',`);
          console.log(`  };`);
          console.log(`  const ctx = new AudioContext();`);
          console.log(`  window.TUNEFRAMES_READY = (async () => {`);
          console.log(`    window._sal = {};`);
          console.log(`    await Promise.all(Object.entries(FILES).map(async ([note, file]) => {`);
          console.log(`      const ab = await (await fetch('${SALAMANDER_BASE}' + file)).arrayBuffer();`);
          console.log(`      window._sal[note] = await ctx.decodeAudioData(ab);`);
          console.log(`    }));`);
          console.log(`  })();\n`);
          console.log(`  // Inside main():`);
          console.log(`  const urls = {};`);
          console.log(`  for (const [note, buf] of Object.entries(window._sal)) {`);
          console.log(`    urls[note] = new Tone.ToneAudioBuffer(buf);`);
          console.log(`  }`);
          console.log(`  const piano = new Tone.Sampler({ urls }).toDestination();`);
          console.log('\nTip: Use window.TUNEFRAMES_READY = Tone.loaded() so the renderer waits for samples to load.');
          break;
        }
        case 'bass': {
          console.log('bass (gleitz CDN — MusyngKite electric_bass_finger)\n');
          console.log(`CDN base URL:\n  ${GLEITZ_BASS}\n`);
          console.log('Filename convention: flat notation only (Bb2.mp3, not A#2.mp3); Tone.Sampler accepts either as keys\n');
          console.log('Copy-paste usage:');
          console.log(`  const bass = new Tone.Sampler({`);
          console.log(`    urls: {`);
          console.log(`      'E1':'E1.mp3', 'A1':'A1.mp3', 'D2':'D2.mp3', 'G2':'G2.mp3',`);
          console.log(`      'B2':'B2.mp3', 'E3':'E3.mp3', 'A3':'A3.mp3', 'D4':'D4.mp3',`);
          console.log(`    },`);
          console.log(`    baseUrl: '${GLEITZ_BASS}',`);
          console.log(`  }).toDestination();`);
          console.log(`  window.TUNEFRAMES_READY = Tone.loaded();`);
          console.log('\nTip: Use window.TUNEFRAMES_READY = Tone.loaded() so the renderer waits for samples to load.');
          break;
        }
        case 'strings': {
          console.log('strings (gleitz CDN — MusyngKite string_ensemble_1)\n');
          console.log(`CDN base URL:\n  ${GLEITZ_STRINGS}\n`);
          console.log('Filename convention: flat notation only (Ab4.mp3, not G#4.mp3); Tone.Sampler accepts either as keys\n');
          console.log('Copy-paste usage:');
          console.log(`  const strings = new Tone.Sampler({`);
          console.log(`    urls: {`);
          console.log(`      'C3':'C3.mp3', 'Eb3':'Eb3.mp3', 'Gb3':'Gb3.mp3', 'Bb3':'Bb3.mp3',`);
          console.log(`      'C4':'C4.mp3', 'Eb4':'Eb4.mp3', 'Gb4':'Gb4.mp3', 'Bb4':'Bb4.mp3',`);
          console.log(`      'C5':'C5.mp3', 'Eb5':'Eb5.mp3', 'Gb5':'Gb5.mp3',`);
          console.log(`    },`);
          console.log(`    baseUrl: '${GLEITZ_STRINGS}',`);
          console.log(`  }).toDestination();`);
          console.log(`  window.TUNEFRAMES_READY = Tone.loaded();`);
          console.log('\nTip: Use window.TUNEFRAMES_READY = Tone.loaded() so the renderer waits for samples to load.');
          break;
        }
        default:
          console.error(`Unknown pack: "${packName}"\nAvailable packs: drums, piano, electric-piano, bass, strings\n\nRun: tuneframes install list`);
          process.exit(1);
      }
      break;
    }

    default:
      console.log(`TuneFrames CLI\n\nCommands:\n  tuneframes render <file.html>  Render composition to MP3\n  tuneframes init <name>         Initialize new project\n  tuneframes preview <file.html> Open in browser\n  tuneframes validate <file.html> Validate composition (headless test render)\n  tuneframes lint <file.html>    Lint composition (static HTML analysis)\n  tuneframes add <preset>         Add preset to composition.html\n  tuneframes instruments          List gleitz CDN instruments for Tone.Sampler\n  tuneframes install <pack>       Discover CDN URLs and usage for sample packs\n\nPresets: ${PRESETS.join(', ')}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});