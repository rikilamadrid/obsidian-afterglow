# Theme Foundation and Token System

## Status

In Progress

## Goal

Afterglow installs in Obsidian as a real community theme and, using one shared
semantic token layer, renders every core surface in both `Pastel Archive` and
`Ultraviolet Library` — so switching modes visibly changes the palette while the
theme stays recognizably the same, with AA contrast proven by an automated check
rather than by eye.

## Context

- Read: `context/project-overview.md` — Requirements, System, Technology, Quality Priorities
- Read: `context/coding-standards.md` — "Project conventions — Afterglow CSS"
- Relevant area: repository root, `src/`, `scripts/`, `.github/workflows/`
- Avoid: per-component styling of individual Obsidian surfaces, third-party
  plugin CSS, Style Settings metadata

Obsidian derives most of its interface from a small set of CSS variables. Overriding
those variables well is what makes this Feature produce a coherent theme across
almost every surface without writing per-surface CSS. Per-surface refinement is
later work and depends on this token layer existing first.

Obsidian's own variable reference is the authority on which variables exist. Prefer
overriding a documented variable over writing a selector.

## Requirements

- `manifest.json` at the repository root with `name` exactly `Afterglow`,
  `version` as strict semver, `author`, and `minAppVersion`. No `id` or
  `description` key — those are plugin-only.
- `theme.css` at the repository root, generated from `src/` by the build script
  and committed. Never hand-edited.
- `README.md`, `LICENSE` (MIT), and a 512×288 screenshot placeholder path in the
  repository, so the release structure is complete and checkable.
- Three token layers, in order: palette (raw values, per mode), semantic roles
  (shared names, defined once), Obsidian variable mapping (roles assigned to
  Obsidian's own variables).
- Semantic roles cover at minimum: page and surface backgrounds, elevated
  surfaces, body text, muted and faint text, headings, borders and fine rules,
  the interactive accent, link, selection, focus ring, hover, disabled, and the
  four semantic states — info, success, warning, error.
- Every semantic role is defined in both `.theme-light` and `.theme-dark`.
  A role present in one mode and absent from the other is a failure.
- Shared across modes and defined once under `body`: typography stacks, type
  scale, spacing scale, border widths, and radii. Only color values differ
  between modes.
- Font stacks use system and local fonts only. No bundled font files, no remote
  fonts, no `@import` by URL.
- No `!important` anywhere. No selector deeper than is necessary; prefer
  Obsidian variables over selectors.
- Body text and essential controls meet WCAG AA against their background in both
  modes. Where a stated palette value cannot reach AA in its intended role,
  adjust the value and record the adjustment in the Feature's notes.
- Dark mode defines glow as a role but applies it only to focus ring, caret,
  active tab, links, and graph nodes. Never to paragraph text.
- Honor `prefers-reduced-motion` for any transition the token layer introduces.
- The check suite runs locally via `npm test` and in GitHub Actions on push and
  pull request, and fails the build on any violation.

## Out of Scope

- Per-surface styling beyond what the Obsidian variable mapping produces:
  callouts, tables, code blocks, graph, command palette, properties, checkboxes,
  modals and mobile navigation are later Features.
- Style Settings metadata.
- Third-party plugin compatibility.
- Publishing to the Obsidian community directory, and the first tagged release.
- Repository directory rename and GitHub remote creation.

## Delivery Chunks

1. **Installable skeleton.** `manifest.json`, `LICENSE`, `README.md`,
   `package.json`, `src/` with a single placeholder module, and the build script
   producing a committed `theme.css`. Verified by loading the theme in a real
   Obsidian vault and seeing it listed and selectable.
2. **Token system and both modes.** Palette, semantic roles, and the Obsidian
   variable mapping, in `src/` modules. Verified by switching modes in a real
   vault and observing both palettes across the interface.
3. **Check suite and CI.** Required-files check, manifest validity, CSS validity
   (stylelint), contrast check over the important text/background pairs,
   remote-asset scan, token parity between modes, and a `theme.css`-matches-`src/`
   sync check. Wired into `npm test` and GitHub Actions.

## Acceptance Criteria

- Obsidian lists `Afterglow` in Appearance → Themes from a vault where the theme
  directory is named `Afterglow`, and selecting it changes the interface.
- Switching between light and dark mode in that vault shows `Pastel Archive` and
  `Ultraviolet Library`, and the two are recognizably the same theme: same
  typography, spacing, borders and shapes, different color values only.
- `npm test` passes and, run against a deliberately broken copy, fails for each
  of: a missing required file, an invalid manifest, a remote asset reference, a
  role defined in only one mode, a below-AA body text pair, and a `theme.css`
  that does not match `src/`. Evidence is the failing output for each case, not
  the assertion that the check exists.
- The GitHub Actions workflow runs the same checks and its result is visible on a
  pull request.
- `grep -rn '!important' src/ theme.css` returns nothing.
- Screenshots of both modes in a real vault, showing the same document.

## Notes / Decisions

- `minAppVersion` is `1.5.0`. No decision blocks this Feature.
- The palette values in `context/project-overview.md` are starting values. The
  contrast check is authoritative; any value it forces to change is recorded as
  a durable decision.
- `theme.css` is generated but committed, because Obsidian and the community
  directory read it directly from the repository.
- Verification here is deliberately split: the check suite proves the artifact is
  valid, and a real Obsidian vault proves it looks right. Neither substitutes for
  the other.

### Recorded palette revision — Pastel Archive (chunk 2, 2026-08-25)

The first pass at the light mode was rejected on real-vault review: it read as
sepia, not as Pastel Archive. The cause was not contrast and not lightness —
the grounds were separated adequately (page/surface 1.099) but every one of
them was a warm neutral at hue ~32°, so the pastels only ever appeared as
callout tints and the mode looked like default Obsidian in beige.

The revision moves the pastels into the **surface hierarchy** and aligns the
two modes hue-for-hue:

- Ivory `#FFF9F2` stays, but is now reserved for the reading canvas alone.
- Sidebars, tabs, panels and secondary surfaces step into the violet identity
  hue: surface `#EFE7FF` (h260), elevated `#E4DCFA` (h256).
- Hover carries the second accent hue in both modes — sky-pale `#D9E9F7`
  (h208) in light, a cyan-cast `#121E32` (h218) in dark — so ordinary
  navigation puts the cyan on screen.
- Every light family sits within 5° of its dark counterpart: violet 258/259,
  sky 200/196, mint 166/163, amber 29/24, blush 347/350. That hue identity is
  the mechanism behind "Ultraviolet Library seen in daylight"; it is not a
  matter of taste and is now checked.

Dark mode kept the black-violet foundation and strengthened accent presence
through Obsidian variables only: violet grounds above the foundation, a more
visible violet border `#3A2B55`, a brighter cyan link `#6FD3F7`, and the accent
mapped onto border-hover, scrollbar-active, icon-active, nav-item-active and
focused-tab text.

### Recorded contrast adjustment — light palette (chunk 2, 2026-08-25)

The stated light pastels cannot carry text on ivory `#FFF9F2`. Measured against
the 4.5:1 requirement:

| Pastel | Value | Contrast on ivory |
| --- | --- | --- |
| lilac | `#D8C7F0` | 1.50:1 |
| powder blue | `#C9E2F2` | 1.28:1 |
| sage | `#CFE3D3` | 1.29:1 |
| apricot | `#F4C9A8` | 1.46:1 |
| rose | `#E8B9C2` | 1.65:1 |

The stated values are kept, unchanged, as **surfaces and tints** — selection,
callout grounds, highlights. Every text-bearing light role instead uses a
deepened variant of the same hue, so the palette's identity is preserved while
the text is legible:

| Role | Value | Derived from | On ivory | On elevated |
| --- | --- | --- | --- | --- |
| `--ag-accent-interactive` | `#5F3AB8` | lilac | 7.21:1 | 5.63:1 |
| `--ag-link` / `--ag-info` | `#175D80` | powder blue | 6.89:1 | 5.38:1 |
| `--ag-success` | `#14705B` | mint | 5.74:1 | — |
| `--ag-warning` | `#8F4E10` | apricot | 6.15:1 | — |
| `--ag-error` | `#A82B47` | blush | 6.48:1 | — |

Text-bearing roles are checked against **every** ground, not just the canvas.
That matters more after the revision than before it: sidebars and tabs are now
colored, so UI text lands on violet surfaces routinely. The first candidate for
`--ag-link` was `#1C6D95`, which passed on ivory at 5.47:1 but failed on the
elevated ground at 4.27:1; it was deepened to `#175D80`.

The dark palette needed no adjustment: ultraviolet `#9A6BFF` is 5.66:1 on
black-violet `#090611`, and every other stated dark value is higher. The one
dark value the revision forced was the hover ground: at `#152238` the accent
fell to 4.49:1 against it, so it was darkened to `#121E32` (4.71:1).

The narrowest passing pair is now `--ag-text-muted` on `--ag-selection`
(4.95:1) in light. Worth re-checking if either value moves.

### Deferred from chunk 2

Dark-mode glow is defined as a role in both modes and applied to links. Focus
ring reaches its color through Obsidian's `--background-modifier-border-focus`.
Glow on the **active tab** and **graph nodes** needs per-surface selectors,
which this Feature's Out of Scope excludes, so it moves to the per-surface
Features rather than being smuggled in here.
