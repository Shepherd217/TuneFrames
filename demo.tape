Output /tmp/demo-terminal.mp4
Set FPS 30
Set Width 1280
Set Height 720
Set Theme Dracul
Set FontFamily "JetBrains Mono"
Set FontSize 18
Set Padding 20

# Initial delay
Sleep 500ms

# ── Show command + execution ─────────────────────────────────────────────────
Hide
Type "tuneframes render examples/example-demo-beat.html --output=demo-beat.mp3" Enter
Sleep 3s
Show

Sleep 1s
Type "tuneframes --help" Enter
Sleep 2s

# ── Show composition file ────────────────────────────────────────────────────
Type "cat examples/example-demo-beat.html" Enter
Sleep 3s
Down
Down
Sleep 200ms
Down
Down
Sleep 200ms
Down
Down
Sleep 200ms

# ── Run the actual render ────────────────────────────────────────────────────
Enter
Type "tuneframes render examples/example-demo-beat.html --output=/tmp/demo-beat.mp3" Enter
Sleep 4s

# ── Check output ──────────────────────────────────────────────────────────────
Type "ls -lh /tmp/demo-beat.mp3" Enter
Sleep 1s

# ── Validate the file ────────────────────────────────────────────────────────
Type "tuneframes validate examples/example-demo-beat.html" Enter
Sleep 3s

# ── Add a preset ────────────────────────────────────────────────────────────
Type "tuneframes add drums-lofi" Enter
Sleep 1s
Type "head -15 composition.html" Enter
Sleep 2s

Sleep 1s