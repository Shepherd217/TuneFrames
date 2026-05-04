#!/usr/bin/env node
/**
 * TuneFrames CLI
 * 
 * Commands:
 *   tuneframes render <file.html> [--output track.mp3]
 *   tuneframes init <project-name>
 *   tuneframes preview <file.html>
 */

const { render } = require('./render');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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
        console.error('Usage: tuneframes render <file.html> [--output=track.mp3]');
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
      // Open in default browser (or just tell user where the file is)
      const url = `file://${path.resolve(inputFile)}`;
      console.log(`Preview: ${url}`);
      if (process.platform === 'darwin') {
        spawn('open', [url]);
      } else if (process.platform === 'linux') {
        spawn('xdg-open', [url]);
      }
      break;
    }

    default:
      console.log(`TuneFrames CLI\n\nCommands:\n  tuneframes render <file.html>  Render composition to MP3\n  tuneframes init <name>         Initialize new project\n  tuneframes preview <file.html> Open in browser`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
