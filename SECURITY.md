# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you find a security vulnerability in TuneFrames:

1. **Do not** open a public GitHub issue
2. Email Nathan Shepherd directly at the GitHub security advisory contact
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

We aim to respond within 48 hours and will keep you updated on progress.

## Scope

TuneFrames renders HTML compositions using headless Chromium. Security concerns specific to TuneFrames:

- **Arbitrary JavaScript execution:** TuneFrames renders user-authored HTML with Tone.js. Only render compositions from trusted sources.
- **File system access:** The renderer writes output to paths specified by the caller. Do not run `tuneframes render` on untrusted HTML files without reviewing them first.
- **FFmpeg:** FFmpeg is invoked as a subprocess. Input files are passed via CLI arguments, not piped input, reducing injection risk.

## Dependencies

Keep dependencies up to date:

```bash
npm audit
npm audit fix
```