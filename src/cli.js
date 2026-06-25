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

    default:
      console.log(`TuneFrames CLI\n\nCommands:\n  tuneframes render <file.html>  Render composition to MP3\n  tuneframes init <name>         Initialize new project\n  tuneframes preview <file.html> Open in browser\n  tuneframes validate <file.html> Validate composition (headless test render)\n  tuneframes lint <file.html>    Lint composition (static HTML analysis)\n  tuneframes add <preset>         Add preset to composition.html\n  tuneframes instruments          List gleitz CDN instruments for Tone.Sampler\n\nPresets: ${PRESETS.join(', ')}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});