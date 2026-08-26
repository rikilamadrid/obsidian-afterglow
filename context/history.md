# Project History

Compact record of completed work.

## Completed

### 2026-08-26 — Feature 01: Theme Foundation and Token System

- Outcome: `Afterglow is installable in Obsidian as a real theme. A three-layer token system — palette, semantic roles, Obsidian variable mapping — renders both Pastel Archive and Ultraviolet Library from one shared role layer, with typography, spacing, borders and shapes defined once for both modes. Nine artifact checks run in GitHub Actions.`
- Verification: `npm test — 9 checks pass, then 14 negative cases are each caught by the check responsible for them. Both modes reviewed in a real vault during chunk 2; that review rejected the first light palette as sepia and produced the recorded palette revision. Narrowest surviving contrast margin is accent-on-hover in dark at 4.71:1 against a 4.5:1 requirement.`
- Commit/PR: `4a064cd, 9e198e4, 8ecb7e0, 181ef2e — PR #1, CI green`
- Follow-up: `screenshot.png is still the flat ivory placeholder. That requirement moved to Feature 02 by human decision on 2026-08-26, along with the brand mark and the README. Glow on the active tab and on graph nodes needs per-surface selectors and moved to the per-surface Features.`
