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
      const outputArg = args.find(a => a.startsWith('--output='));
      const outputFile = outputArg
        ? outputArg.split('=')[1]
        : inputFile.replace(/\.html$/, '.mp3');

      if (!inputFile) {
        console.error('Usage: tuneframes render <file.html> [--output=track.mp3] [--format wav]');
        process.exit(1);
      }

      if (!fs.existsSync(inputFile)) {
        console.error(`File not found: ${inputFile}`);
        process.exit(1);
      }

      console.log(`Rendering ${inputFile} → ${outputFile}`);
      const result = await render(inputFile, outputFile);
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

    case 'add': {
      const [presetName] = args;
      if (!presetName) {
        console.error(`Usage: tuneframes add <preset>\nAvailable: ${PRESETS.join(', ')}`);
        process.exit(1);
      }
      if (!PRESETS.includes(presetName)) {
        console.error(`Unknown preset: ${presetName}\nAvailable: ${PRESETS.join(', ')}`);
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

    default:
      console.log(`TuneFrames CLI\n\nCommands:\n  tuneframes render <file.html>  Render composition to MP3\n  tuneframes init <name>         Initialize new project\n  tuneframes preview <file.html> Open in browser\n  tuneframes validate <file.html> Validate composition (headless test render)\n  tuneframes add <preset>         Add preset to composition.html\n\nPresets: ${PRESETS.join(', ')}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});