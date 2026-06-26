# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.x     | Yes — security fixes backported to current minor |

Versions prior to the current 0.x release are not maintained. Upgrade to the latest published version before reporting.

## Reporting a Vulnerability

Email **security@tuneframes.dev** with the following:

- **Description** — what the vulnerability is and where it exists
- **Reproduction steps** — minimal steps or a proof-of-concept file to trigger the issue
- **Impact** — what an attacker can do if the issue is exploited

Do **not** open a public GitHub issue for security vulnerabilities. Public disclosure before a patch is available puts all users at risk.

We will acknowledge your report within **48 hours** and keep you informed as we investigate and prepare a fix. We credit reporters in release notes unless you prefer to remain anonymous.

## Scope

These are the classes of issue we consider in scope for TuneFrames:

- **Arbitrary code execution via malicious HTML compositions** — Playwright renders pages with some Chromium sandbox relaxation. A crafted composition HTML could exploit that to execute code on the rendering host.
- **Path traversal in `--output` flag handling** — if the output path is insufficiently sanitized, a composition could redirect output to an arbitrary filesystem location.
- **Dependency vulnerabilities in Playwright or FFmpeg integrations** — known CVEs in `playwright-core` or in the FFmpeg binary invoked as a subprocess that are exploitable through TuneFrames's usage patterns.
- **npm publish credential exposure** — anything that could leak publish tokens or allow unauthorized package releases.

> **Note on network exposure during rendering.** Compositions run in a headless Chromium instance. Malicious HTML can make outbound network requests, which could be used to exfiltrate data from the rendering environment (environment variables, filesystem contents reachable from the page context). A `--no-network` flag to disable network access during rendering is a planned future feature. Until then, only render compositions from sources you trust.

## Out of Scope

The following are **not** considered security vulnerabilities for this project:

- Audio quality issues, missing genres, or incorrect output duration
- Rate limiting — TuneFrames has no server component
- Authentication bypass — TuneFrames has no authentication layer
- Bugs that require physical access to the machine running TuneFrames
- Social engineering attacks against maintainers
