# TuneFrames MCP Server

The TuneFrames MCP server puts music rendering directly inside Claude, Cursor, and any MCP-compatible agent. Claude writes the HTML composition; TuneFrames renders it to an MP3.

---

## Install

```bash
npm install -g tuneframes
```

This installs two binaries: `tuneframes` (CLI) and `tuneframes-mcp` (MCP server).

---

## Connect to Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "tuneframes": {
      "command": "tuneframes-mcp"
    }
  }
}
```

Restart Claude Desktop. The three TuneFrames tools will appear in the tool picker.

---

## Connect to Claude Code

Add to `.claude/settings.json` in your project, or to `~/.claude/settings.json` for all projects:

```json
{
  "mcpServers": {
    "tuneframes": {
      "command": "tuneframes-mcp",
      "type": "stdio"
    }
  }
}
```

If `tuneframes-mcp` is not on your PATH (e.g. installed locally), use the full path:

```json
{
  "mcpServers": {
    "tuneframes": {
      "command": "npx",
      "args": ["tuneframes-mcp"],
      "type": "stdio"
    }
  }
}
```

---

## Tools

### `render_music`

Render an HTML/Tone.js composition to an MP3 file.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `html` | string | yes | Complete HTML composition |
| `output` | string | no | Output path (default: OS temp dir) |
| `timeout` | number | no | Render timeout in seconds (default: 90) |

**Returns:** `{ "path": "/tmp/tuneframes-1234.mp3", "size_bytes": 123456 }`

**Composition rules the agent must follow:**
- Include `<div id="tuneframes" style="display:none">{"bpm":120,"duration":"16s"}</div>` — duration in literal seconds, not note values.
- Define an `async function main()` that schedules all Tone.js instruments.
- Avoid `Reverb`, `Freeverb`, `BitCrusher`, `Chebyshev` — these are stubbed in headless render. Use `FeedbackDelay` instead.
- Schedule notes in chronological order per instrument (never go backwards in time on the same synth).

---

### `list_skills`

List all available genre templates.

**Input:** none

**Returns:**

```json
{
  "skills": [
    { "name": "lofi", "description": "Lo-fi Hip Hop — dusty jazzy chords, soft keys, muffled drums, chill study vibe", "bpm_range": "70–90" },
    { "name": "techno", "description": "...", "bpm_range": "130–150" }
  ]
}
```

---

### `get_skill`

Get a complete example HTML composition for a genre.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `genre` | string | yes | Genre name: `lofi`, `techno`, `jazz`, `ambient`, `house`, etc. |

**Returns:** The full HTML of the example composition, ready to pass to `render_music`.

---

## Example Claude Conversation

```
User: Make me a 20-second lo-fi hip hop track and save it to ~/Music/study-session.mp3

Claude: I'll get the lo-fi template first, then render it with a longer duration.

[calls get_skill({ genre: "lofi" })]
[receives example HTML]

Now rendering with duration adjusted to 20s...

[calls render_music({
  html: "...(modified HTML with duration:\"20s\")...",
  output: "/Users/you/Music/study-session.mp3",
  timeout: 120
})]

Done. Your track is at ~/Music/study-session.mp3 (1.8 MB).
```

---

## Genre Reference

Run `list_skills` or `tuneframes --help` to see all 20 genres. Current library includes:

ambient, boss-battle, chillwave, cinematic, classical, dnb, downtempo, folk, funk, future-bass, hip-hop, house, indie-pop, jazz, lofi, minimal, orchestral, r-and-b, techno, trap

---

## Troubleshooting

**`tuneframes-mcp: command not found`** — run `npm install -g tuneframes` or use `npx tuneframes-mcp` in the config.

**Render times out** — increase `timeout` (default 90s). CDN sample packs need extra time on first load.

**Audio is silent / no drums** — check that notes are scheduled in chronological order. Sort your trigger times before calling `triggerAttackRelease`.

**Reverb/effects not working** — `Reverb`, `Freeverb`, `BitCrusher`, and `Chebyshev` are patched to passthrough in headless render. Use `FeedbackDelay` for spatial depth.
