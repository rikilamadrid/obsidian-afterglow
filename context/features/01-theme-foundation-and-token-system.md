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
