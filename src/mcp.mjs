#!/usr/bin/env node
// src/mcp.mjs — TuneFrames MCP Server
// Exposes 3 tools: render_music, list_skills, get_skill

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createRequire } from 'module';
import { writeFileSync, unlinkSync, existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const require = createRequire(import.meta.url);
const { render } = require('./render.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, '../skills');
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const AGENT_INSTRUCTIONS = [
  'TuneFrames renders HTML/Tone.js compositions to MP3 audio files.',
  'To compose music: write an HTML file with a main() function that schedules Tone.js instruments.',
  'Required metadata: <div id="tuneframes" style="display:none">{"bpm":120,"duration":"16s"}</div>',
  'Duration MUST be literal seconds ("16s") — not note values ("4n").',
  'Avoid: Reverb, Freeverb, BitCrusher, Chebyshev — use FeedbackDelay instead.',
  'Schedule notes in chronological order per instrument.',
].join('\n');

const server = new Server(
  {
    name: 'tuneframes',
    version: pkg.version,
    description: AGENT_INSTRUCTIONS,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'render_music',
      description:
        'Compose and render music to an MP3 file. Write a complete HTML composition using Tone.js, including the required metadata block and main() function.',
      inputSchema: {
        type: 'object',
        properties: {
          html: {
            type: 'string',
            description: 'Complete HTML composition with Tone.js',
          },
          output: {
            type: 'string',
            description: 'Output file path (default: OS temp dir)',
          },
          timeout: {
            type: 'number',
            description: 'Render timeout in seconds (default: 90)',
          },
        },
        required: ['html'],
      },
    },
    {
      name: 'list_skills',
      description: 'List available music genre composition templates',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_skill',
      description:
        'Get an example HTML composition for a specific genre to use as a starting point',
      inputSchema: {
        type: 'object',
        properties: {
          genre: {
            type: 'string',
            description: 'Genre name e.g. "lofi", "techno", "jazz", "ambient"',
          },
        },
        required: ['genre'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'render_music') return handleRenderMusic(args);
  if (name === 'list_skills') return handleListSkills();
  if (name === 'get_skill') return handleGetSkill(args);

  throw new Error(`Unknown tool: ${name}`);
});

// ── render_music ──────────────────────────────────────────────────────────────

async function handleRenderMusic(args) {
  const { html, output, timeout = 90 } = args;
  const ts = Date.now();
  const tmpFile = join(tmpdir(), `tuneframes-${ts}.html`);
  const outputPath = output || join(tmpdir(), `tuneframes-${ts}.mp3`);

  try {
    writeFileSync(tmpFile, html, 'utf8');
    await render(tmpFile, outputPath, 'mp3', timeout * 1000);
    const size = statSync(outputPath).size;
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ path: outputPath, size_bytes: size }),
        },
      ],
    };
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
    };
  } finally {
    if (existsSync(tmpFile)) {
      try { unlinkSync(tmpFile); } catch {}
    }
  }
}

// ── list_skills ───────────────────────────────────────────────────────────────

function parseSkillMd(content) {
  const description = (content.match(/^description:\s*(.+)$/m) || [])[1]?.trim() || '';
  const bpmRange = (content.match(/BPM range:\s*([^\n]+)/i) || [])[1]?.trim() || '';
  return { description, bpm_range: bpmRange };
}

async function handleListSkills() {
  try {
    const entries = readdirSync(SKILLS_DIR);
    const skills = [];

    for (const entry of entries) {
      if (!entry.startsWith('audio-')) continue;
      const skillMdPath = join(SKILLS_DIR, entry, 'SKILL.md');
      if (!existsSync(skillMdPath)) continue;

      const content = readFileSync(skillMdPath, 'utf8');
      const { description, bpm_range } = parseSkillMd(content);
      const genre = entry.replace(/^audio-/, '');

      skills.push({ name: genre, description, bpm_range });
    }

    return {
      content: [{ type: 'text', text: JSON.stringify({ skills }) }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
    };
  }
}

// ── get_skill ─────────────────────────────────────────────────────────────────

async function handleGetSkill(args) {
  const { genre } = args;

  try {
    const candidates = [
      join(SKILLS_DIR, `audio-${genre}`),
      join(SKILLS_DIR, genre),
    ];

    let skillDir = null;
    for (const c of candidates) {
      if (existsSync(c)) { skillDir = c; break; }
    }

    if (!skillDir) {
      const available = readdirSync(SKILLS_DIR)
        .filter(e => e.startsWith('audio-'))
        .map(e => e.replace(/^audio-/, ''));
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Genre "${genre}" not found. Available: ${available.join(', ')}`,
            }),
          },
        ],
      };
    }

    const examplePath = join(skillDir, 'example.html');
    if (!existsSync(examplePath)) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `No example.html found for genre "${genre}"` }),
          },
        ],
      };
    }

    const html = readFileSync(examplePath, 'utf8');
    return {
      content: [{ type: 'text', text: html }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
    };
  }
}

// ── bootstrap ─────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error('TuneFrames MCP server error:', err);
  process.exit(1);
});
