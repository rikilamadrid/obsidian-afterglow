# Afterglow Brand Identity and Release Documentation

## Status

Ready

## Goal

Someone who lands on `github.com/rikilamadrid/obsidian-afterglow` sees what
Afterglow actually looks like — a repository-local brand mark, a real 512×288
listing screenshot, and light and dark previews taken from a real Obsidian vault
— reads an accurate README that never claims a release or a directory listing
that does not exist, and can install the theme from it without asking a
question.

## Context

- Read: `context/project-overview.md` — Product, Scope, Requirements, Delivery
  Workflow, Quality Priorities, Durable Decisions
- Read: `context/features/01-theme-foundation-and-token-system.md` — the two
  recorded palette sections; the mode names and their meaning come from there
- Read: `src/02-palette.css` — the mark's colors are drawn from this file, not
  invented
- Read: `scripts/checks/required-files.mjs`, `scripts/checks/css-policy.mjs`,
  `scripts/check-negative.mjs` — the artifact contract this Feature extends
- Relevant area: repository root (`README.md`, `screenshot.png`), a new
  `assets/` directory, `scripts/checks/`
- Avoid: `src/`, `theme.css`, `manifest.json`, the token system, and every
  Obsidian surface. This Feature changes no rendered pixel of the theme.

Two constraints shape everything here.

`screenshot.png` is fixed at 512×288 by the community directory and by
`required-files`. That is too small to show the theme working. The README
therefore needs larger previews as separate files, and `screenshot.png` stays a
tight, legible crop of the same document.

`css-policy` forbids `url()` anywhere in `src/` or `theme.css`. The brand mark
is a README and repository asset only. Nothing in this Feature may reference it
from CSS, and the policy check must keep failing if anything ever does.

## Requirements

### Brand mark

- One SVG mark lives at `assets/afterglow-mark.svg`, hand-authored, with no
  embedded raster data, no external references, no fonts required to render, and
  no `<script>`.
- A second SVG at `assets/afterglow-wordmark.svg` pairs the mark with the word
  `Afterglow` as vector paths or as a system-font `<text>` with an explicit
  generic fallback — never a font the viewer must have installed.
- The mark's colors are existing palette values from `src/02-palette.css`, cited
  by name in a comment inside the SVG. No new color is introduced by this
  Feature.
- The mark reads correctly on GitHub's light and dark page backgrounds. It uses
  no near-white and no near-black fill, or it ships as a light/dark pair
  selected with `<picture>` and `prefers-color-scheme`.
- The mark is legible at 32px and at 320px, and carries no text at 32px.
- Every image the README references has alternative text.

### Screenshots

- `screenshot.png` is replaced with a real Obsidian capture at exactly 512×288.
  A flat fill, a mockup, a browser render of hand-written HTML, or anything not
  produced by Obsidian rendering `theme.css` fails this Feature.
- `assets/preview-light.png` and `assets/preview-dark.png` are full-window
  captures of **the same note, same scroll position, same open panes**, in
  Pastel Archive and Ultraviolet Library. The pair is the evidence for the
  identity claim; it is worthless if the two shots differ in content.
- The captured note contains no personal or vault-private content. It is a
  purpose-written sample note committed under `assets/`, so both captures are
  reproducible by anyone with the repository.
- The captures show what Feature 01 actually delivers: editor and reading text,
  headings, links, tags, file explorer, tabs, and the ribbon. They do not stage
  surfaces that per-surface Features have not refined yet.
- Preview PNGs are optimized; each is under 500 KB. They are documentation
  assets and are never release assets.

### README

The README covers, in this order: brand mark, tagline, what Afterglow is, light
and dark previews, design philosophy, Pastel Archive, Ultraviolet Library,
install, status, roadmap, development, checks, design rules, credits, license.

- The tagline is one line, appears directly under the mark, and is the same
  sentence used in the repository's GitHub description.
- Pastel Archive and Ultraviolet Library each get a short paragraph naming the
  identity hue relationship recorded in Feature 01 — same five hue families,
  each light family within 5° of its dark counterpart — because that is the
  product thesis and it is verifiable by a check.
- Status states plainly that Afterglow is **not** in the Obsidian community
  directory, has **no** tagged release, and is installed manually.
- The roadmap lists remaining work as unstarted, with no dates and no version
  promises.
- Install instructions are the manual-install path, and are correct enough that
  following them literally produces a working theme.
- Credits name the author and, if any external reference informed the palette,
  name it. Invent no endorsement and no contributor.
- No claim of marketplace availability, release readiness, download counts,
  users, stars, or third-party approval appears anywhere.
- Nothing the README states about the check suite may exceed what `npm test`
  actually runs.

### Check suite

- A new `docs-assets` check verifies that every local path referenced by an
  `<img>`, `<picture>`, or Markdown image in `README.md` resolves to a file that
  exists in the repository, and that each expected `assets/` entry is present.
  `required-files` is **not** extended; it stays the release contract covering
  only what Obsidian and the community directory read.
- A check verifies that `screenshot.png` is not the placeholder: assert a
  minimum number of distinct colors, or a minimum byte size, or both. The
  current placeholder is 879 bytes of flat ivory and must fail whatever
  threshold is chosen.
- Every new check gets at least one negative case in `scripts/check-negative.mjs`.
  The existing coverage guard already fails the run otherwise.
- `css-policy` keeps failing on `url()` in `src/` or `theme.css`. Adding
  `assets/` must not weaken it.
- `npm test` and the GitHub Actions workflow pass on the branch.

## Out of Scope

- Any change to `src/`, `theme.css`, or `manifest.json`.
- Per-surface styling of callouts, tables, code blocks, graph, or command
  palette. Those are later Features; this one photographs what exists.
- Creating any other theme, or any structure that anticipates one — no `themes/`
  directory, no per-theme configuration, no shared-toolkit package.
- Extracting build or check scripts into a reusable package. See Notes.
- The first tagged release, the `CHANGELOG.md`, and the community directory
  submission.
- The repository's GitHub description, topics, and social preview image. Those
  are GitHub settings the human sets; this Feature only supplies the text and
  the asset.
- Style Settings, plugin compatibility, and mobile-specific captures.

## Delivery Chunks

1. **Brand mark.** `assets/afterglow-mark.svg` and
   `assets/afterglow-wordmark.svg`. Verified by opening both at 32px and 320px
   against a light and a dark background, and by confirming no external
   reference appears in either file.
2. **Real screenshots.** The sample note, the two full-window previews, and the
   replaced `screenshot.png`. Verified by the human's visual review in Obsidian,
   step by step, per the Acceptance Criteria below. Blocks chunk 3.
3. **README and checks.** The rewritten README, the two new checks, their
   negative cases, and a green CI run.

Chunk 2 cannot be done by an agent alone. Capturing it requires a real Obsidian
window on the human's machine.

## Acceptance Criteria

### Visual review the human performs in Obsidian

Perform these in the test vault with the repository linked at
`.obsidian/themes/Afterglow`. Every step is a pass/fail the human records.

1. **Load.** Run `npm run build`. In Obsidian, open Settings → Appearance →
   Themes and confirm `Afterglow` is selected. In the developer console
   (`Cmd+Opt+I`), run
   `getComputedStyle(document.body).getPropertyValue('--ag-theme')` and confirm
   it returns `afterglow`. If it does not, the theme is listed but not loaded
   and every later step is meaningless.
2. **Prepare the shot.** Open the sample note. Open the file explorer in the
   left sidebar and at least two tabs. Set the window to a fixed size — 1600×1000
   is the recommendation — and note it, because both captures must use it.
   Scroll to the top.
3. **Light.** Set Appearance → Base color scheme to Light. Confirm the reading
   canvas is ivory and the sidebar, tabs and panels are violet-pale, not ivory.
   If the whole window is one warm neutral, this is the sepia regression that
   Feature 01 recorded; stop and report it. Capture the full window to
   `assets/preview-light.png`.
4. **Dark.** Switch Base color scheme to Dark. **Change nothing else** — same
   note, same scroll, same panes, same window size. Confirm the foundation is
   black-violet and that glow appears on links and the focus ring only, never on
   paragraph text. Capture to `assets/preview-dark.png`.
5. **Identity check.** Open both captures side by side. Typography, spacing,
   borders and component shapes must be identical; only color may differ. If a
   shape or a spacing differs, that is a Feature 01 defect, not a screenshot
   problem — report it rather than retouching the image.
6. **Listing crop.** Produce `screenshot.png` at exactly 512×288 from the same
   document, in **dark — Ultraviolet Library**, decided by the human on
   2026-08-26. At that size, confirm body text is still legible and the crop
   shows more than one surface.
7. **Reduced motion.** Enable the OS reduced-motion setting, reload Obsidian,
   and confirm the interface still works and nothing animates.
8. **Honesty pass.** Read the finished README against the two captures. Every
   visual claim it makes must be visible in them. Delete any claim that is not.

### Automated and repository criteria

- `npm test` passes: all checks, then all negative cases including the new ones.
- `npm run check:negative` fails the run if the new checks are added without
  negative cases, and the placeholder-detection case reverts `screenshot.png` to
  a flat fill and is caught.
- The GitHub Actions workflow is green on the Feature branch and its result is
  visible on the pull request.
- `grep -rn 'url(' src/ theme.css` returns nothing.
- `grep -rniE 'https?://|xlink:href' assets/*.svg` returns nothing.
- Opening the pull request's Files tab and the rendered README on GitHub shows
  the mark, both previews, and no broken image, in both GitHub light and dark
  themes.
- The words `marketplace`, `community directory` and `release` appear in the
  README only in sentences that say Afterglow is **not** there yet.
- `git status` is clean and `theme.css` is unchanged by this Feature's diff.

## Notes / Decisions

### Recorded decision — one repository per theme

Each future theme is its own repository, on the Afterglow model: its own
`manifest.json`, its own `theme.css`, its own release tags, its own community
directory entry. This repository stays single-theme and standalone.

The reason is not preference. Obsidian's community directory lists one theme per
repository entry, a release tag must match one `manifest.json` `version`, and a
vault theme directory must be named exactly for the theme it holds. A
multi-theme repository would have to fight all three.

What is shared across the family is branding language, spec and workflow
templates, and eventually tooling — never a shipped artifact.

### Toolkit extraction — deferred, deliberately

The build script, the nine checks, the negative harness and the CI workflow are
the obvious extraction candidates. They are not extracted now.

One repository is not evidence of duplication. Nothing here has been copied even
once, the check thresholds are still moving, and a package with a single
consumer is a second thing to version for no return. Extraction becomes worth
proposing when a second theme exists and has actually copied these scripts —
and even then the cheaper first move is a template repository, not a published
package.

The signal to revisit: the same check is fixed twice in two repositories.

### Decisions resolved by the human (2026-08-26)

- `screenshot.png` shows **dark — Ultraviolet Library**.
- The sample note **is committed** under `assets/`, so both captures are
  reproducible by anyone with the repository.
- Documentation assets get **their own check**. They are not added to
  `required-files`, which stays the release contract for what Obsidian and the
  community directory read.
- The GitHub social preview and repository avatar are **not configured** by this
  Feature.

No open decision blocks this Feature.

### Risks

- The previews photograph a theme whose per-surface work is unfinished. They
  will be retaken before the first release, and the README must not describe
  surfaces the captures do not show.
- A placeholder-detection check is a heuristic. It proves the screenshot is not
  flat; it cannot prove the screenshot is Obsidian. Only the human's review does
  that.
- README image rendering differs between GitHub, the community directory, and a
  local Markdown preview. GitHub's rendering is the one this Feature verifies.
