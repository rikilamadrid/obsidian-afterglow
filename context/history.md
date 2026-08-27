# Project History

Compact record of completed work.

## Completed

### 2026-08-27 — Feature 02: Afterglow Brand Identity and Release Documentation

- Outcome: `Afterglow now has repository-local vector branding, a controlled sample note, matched real-vault previews for Pastel Archive and Ultraviolet Library, a real 512×288 listing screenshot, accurate installation and development documentation, a runtime identity marker, and deterministic documentation-asset and placeholder-screenshot checks.`
- Verification: `Human acceptance followed real-vault review of both modes and the runtime --ag-theme marker. npm test passes 11 repository checks and catches all 20 negative cases; npm run lint and the GitHub Actions checks are green. GitHub's Markdown renderer resolves the wordmark and both preview assets from the merged branch.`
- Commit/PR: `9eb9ef1 — PR #2, squash-merged with CI green`
- Follow-up: `Publish release 0.1.0 with manifest.json and theme.css, then submit Afterglow to the Obsidian Community Themes directory. Per-surface and mobile refinement remain later Features.`

### 2026-08-26 — Feature 01: Theme Foundation and Token System

- Outcome: `Afterglow is installable in Obsidian as a real theme. A three-layer token system — palette, semantic roles, Obsidian variable mapping — renders both Pastel Archive and Ultraviolet Library from one shared role layer, with typography, spacing, borders and shapes defined once for both modes. Nine artifact checks run in GitHub Actions.`
- Verification: `npm test — 9 checks pass, then 14 negative cases are each caught by the check responsible for them. Both modes reviewed in a real vault during chunk 2; that review rejected the first light palette as sepia and produced the recorded palette revision. Narrowest surviving contrast margin is accent-on-hover in dark at 4.71:1 against a 4.5:1 requirement.`
- Commit/PR: `4a064cd, 9e198e4, 8ecb7e0, 181ef2e — PR #1, CI green`
- Follow-up: `screenshot.png is still the flat ivory placeholder. That requirement moved to Feature 02 by human decision on 2026-08-26, along with the brand mark and the README. Glow on the active tab and on graph nodes needs per-surface selectors and moved to the per-surface Features.`
