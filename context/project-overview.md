# Project Overview

Durable, project-wide context.

Keep this concise. Feature scope, active work, history, and temporary
planning belong elsewhere.

Two words keep an unmade decision visible:

- `TBD` — a human decision is still required
- `None` — considered and intentionally excluded

Leave nothing blank. A blank field is indistinguishable from an abandoned one.

## Project

- Name: `Afterglow`
- Stage: `idea`
- Repo type: `application` (standalone Obsidian community theme)
- Primary goal: `A user switches between light and dark mode and immediately recognizes the same theme identity, and both modes stay readable and coherent through real Obsidian work.`

## Product

- Problem: `Obsidian theme users choose between a light theme and a dark theme that feel unrelated, or accept a mechanical inversion where one mode is clearly an afterthought.`
- Primary user: `Any Obsidian user who reads and writes for long stretches and wants an expressive but professional theme in both modes.`
- First useful outcome: `A single installable theme whose essential surfaces are styled consistently in both modes from one shared token system.`
- Distinctive quality: `Two named modes — Pastel Archive (light) and Ultraviolet Library (dark) — that are two expressions of one identity, sharing typography, spacing, borders, component shapes and semantic color roles while differing only in token values.`
- Avoid becoming: `Two stylesheets that drift apart; a customization framework; a screenshot theme that is exhausting to actually work in.`

## Scope

### In

- One theme, two coordinated modes, one shared semantic token layer
- Light mode `Pastel Archive`: warm, editorial, archival, softly colorful
- Dark mode `Ultraviolet Library`: luminous, contemplative, restrained neon accents
- Essential Obsidian surfaces: editor and reading view; headings and inline
  Markdown; file explorer and ribbon; tabs and navigation;
  properties/frontmatter; links, backlinks and tags; local and global graph;
  search and command palette; callouts; checkboxes and task states; tables;
  code blocks and inline code; modals and settings; mobile navigation and
  sidebars
- Interaction and semantic states: focus, hover, selected, disabled, warning,
  success, error
- Desktop and mobile
- Automated checks: required files, manifest validity, CSS validity, contrast
  of important text/background pairs, absence of remote assets, token parity
  between modes
- Community directory release structure: `manifest.json`, `theme.css`,
  `README.md`, `LICENSE`, 512×288 screenshot, semver GitHub releases

### Out

- Style Settings support in the first release — deferred until token names stop moving
- Broad third-party plugin styling, beyond any small compatibility baseline a
  Feature justifies
- Bundled font files — system and local font stacks only
- Any dependency on the Lorekeeper project; complementing it visually is
  optional and never a requirement
- JavaScript in the shipped theme
- Separate Pastel Archive and Ultraviolet Library products

## Requirements and Open Decisions

Record only what constrains the work. An open decision stays `TBD` until a
human resolves it.

| Type | Item | Notes |
| --- | --- | --- |
| Requirement | Theme name is `Afterglow` | Chosen 2026-08-25. Obsidian forbids changing `name` after directory submission. Checked against the community registry; no conflict. |
| Requirement | Theme directory name must exactly equal the manifest `name` | Obsidian will not detect the theme otherwise. |
| Requirement | No remote assets and no network calls | Obsidian community theme policy, and a privacy/offline requirement. |
| Requirement | No `!important` declarations | Obsidian policy; `!important` blocks users' own CSS snippets. |
| Requirement | Override Obsidian CSS variables under `body`, `.theme-light`, `.theme-dark`; use `:root` sparingly | Obsidian theme guidelines. |
| Requirement | Avoid deep selectors targeting internal Obsidian classes | They break when Obsidian updates. |
| Requirement | WCAG AA contrast for body text and essential controls, in both modes | Verified by an automated check, not by eye. |
| Requirement | `version` is strict semver `x.y.z`; the release tag matches it exactly | Obsidian submission requirement. |
| Requirement | Release assets are `manifest.json` and `theme.css` | Obsidian submission requirement. |
| Requirement | Both modes define every semantic token — no mode-only roles | Enforced by the token parity check. |
| Constraint | Pastel and neon colors carry hierarchy, semantics and interaction — never body paragraphs | Readability over decoration. |
| Constraint | Dark-mode glow only on short-lived or selected elements: active tab, caret, focus ring, links, graph nodes | Never on paragraph text. |
| Constraint | CSS-feasible only; nothing requiring changes to Obsidian itself | |
| Preference | Light palette: ivory `#FFF9F2`, ink `#27242A`, lilac `#D8C7F0`, powder blue `#C9E2F2`, sage `#CFE3D3`, apricot `#F4C9A8`, rose `#E8B9C2` | Starting values; contrast checks may adjust them. |
| Preference | Dark palette: black-violet `#090611`, aubergine surfaces, ivory text, ultraviolet `#9A6BFF`, tangerine `#FF8A3D`, mint `#5CF2C7` | Starting values; contrast checks may adjust them. |
| Preference | Avoid: notebook lines, coffee imagery, kawaii decoration, excessive pills, low-contrast pastel text, cyan-magenta cyberpunk, CRT effects, arcade fonts, wallpaper | Explicit anti-aesthetics. |
| Requirement | `minAppVersion` is `1.5.0` | Chosen 2026-08-25. Obsidian is at 1.13.7; everything the token layer relies on shipped well before 1.5, so wide compatibility costs nothing. |
| Requirement | Local project directory is `~/Workspace/obsidian-afterglow` | Resolved 2026-08-25. The rename is done; this is not the vault theme directory, which must be named `Afterglow`. |
| Requirement | Remote is `https://github.com/rikilamadrid/obsidian-afterglow`, and `main` tracks `origin/main` | Resolved 2026-08-25. Feature branches push to this remote; releases and the community directory submission point at it. |

## System

Record only important project-wide architecture and constraints.

- Architecture: `A shared semantic token layer defined once under body, with .theme-light and .theme-dark supplying only values for the same role names. Component styling consumes roles and never raw palette values. Source lives in src/ and is concatenated into the single shipped theme.css.`
- Main components: `src/ token and component modules; build script producing theme.css; check scripts; manifest.json; release artifacts.`
- Constraints: `Obsidian loads exactly one theme.css. theme.css is generated, committed, and verified in CI to match src/.`

Optional flow:

```text
[src/*.css] -> [build: concatenate] -> [theme.css] -> [checks: css, contrast, assets, token parity] -> [GitHub release]
```

## Technology

The stack an agent must follow rather than choose. Keep the rows this project
actually has.

| Layer | Choice | Reason |
| --- | --- | --- |
| Platform/runtime | Obsidian desktop and mobile | Target application. |
| Language(s) | CSS for the theme; JavaScript (Node) for dev tooling only | No JavaScript ships in the theme. |
| UI/presentation | Obsidian CSS custom properties, overridden under `body`, `.theme-light`, `.theme-dark` | Required by Obsidian theme guidelines. |
| Backend/application | `None` | |
| Data storage and access | `None` | |
| Auth | `None` | |
| Testing | Node check scripts run locally and in GitHub Actions: required files, manifest validity, CSS validity, contrast, remote-asset scan, token parity, theme.css/src sync | A theme has no unit-testable logic; checks verify the shipped artifact. |
| Build and package tooling | Node script concatenating `src/*.css` into `theme.css`; stylelint; GitHub Actions | Dev dependencies only; never shipped. |

## Commands

The commands an agent runs to verify its own work.

```text
install: npm ci
run/dev: npm run build, then load the theme from a test vault's .obsidian/themes/Afterglow
test: npm test
lint/static analysis: npm run lint
build/package: npm run build
```

## Delivery Workflow

| Area | Choice |
| --- | --- |
| Git workflow | Short-lived Feature branches off `main` |
| Default branch | `main` |
| Branch naming | `feature/NN-slug` |
| Commit convention | Conventional Commits |
| Review policy | Human reviews and accepts every Feature before merge |
| Merge strategy | Squash merge |
| CI/CD | GitHub Actions running lint and the check suite on push and pull request |
| Versioning and changelog | Semantic versioning; `manifest.json` `version` is the source of truth; `CHANGELOG.md` maintained |
| Release process | Tag matching `manifest.json` `version`, GitHub release with `manifest.json` and `theme.css` as assets; community directory submission via community.obsidian.md |

## Environments and Integrations

| Area | Choice | Notes |
| --- | --- | --- |
| Local development | A test Obsidian vault with the theme directory linked into `.obsidian/themes/Afterglow` | Directory name must match the manifest `name`. |
| Preview/staging | `None` | |
| Production | Obsidian community theme directory | Public listing at community.obsidian.md. |
| Configuration and secrets | `None` | No credentials of any kind in this repository. |
| External services/APIs | `None` | Remote assets and network calls are forbidden. |

## Quality Priorities

Rank only what matters for this project, highest first.

1. `Readability during long reading and writing sessions`
2. `Accessibility — WCAG AA contrast, visible focus, reduced motion`
3. `Identity coherence between the two modes`
4. `Resilience to Obsidian updates`
5. `Maintainability of the token system`

| Concern | Target or decision |
| --- | --- |
| Correctness/reliability | Every essential surface styled in both modes; no unstyled or broken surface in a supported Obsidian version. |
| Security/privacy | No network calls, no remote assets, no telemetry, no JavaScript. |
| Accessibility | WCAG AA contrast for body text and essential controls, verified automatically; visible focus states; honor `prefers-reduced-motion`. |
| Performance | Lightweight CSS, no JavaScript, no bundled binary assets beyond the listing screenshot. |
| Supported platforms | Obsidian desktop and mobile, version 1.5.0 and above. |

## Durable Decisions

Decisions that outlive a Feature, including approved prototype direction and
anything a prototype proved must not reach production.

| Date | Decision | Reason |
| --- | --- | --- |
| `2026-08-25` | Theme name is `Afterglow`; modes are `Pastel Archive` and `Ultraviolet Library` | Chosen by the human after registry conflict research. The manifest `name` cannot change after directory submission. |
| `2026-08-25` | One theme with two modes, never two products | Identity coherence is the whole product thesis. |
| `2026-08-25` | Shared semantic token layer; modes supply values only | Prevents the two modes from drifting apart. |
| `2026-08-25` | This repository is the standalone theme repository, at `~/Workspace/obsidian-afterglow` and `https://github.com/rikilamadrid/obsidian-afterglow`, with `main` tracking `origin/main` | Rename and remote completed by the human on 2026-08-25; this closes the last open decision. |
| `2026-08-25` | Author CSS as `src/` modules concatenated into a committed `theme.css` | Keeps the token layer separate from component styling; CI can make drift a build failure. |
| `2026-08-25` | Node dev tooling plus GitHub Actions for the check suite | Contrast and token-parity checks need real computation, not grep. |
| `2026-08-25` | MIT license | Permissive, and the common choice for Obsidian community themes. |
| `2026-08-25` | Style Settings deferred past the first release | Adding it early would lock token names into a public contract before they settle. |
| `2026-08-25` | System and local font stacks only; no bundled font files | Avoids licensing and size cost, and satisfies the no-remote-assets policy without effort. |
| `2026-08-25` | `minAppVersion` is `1.5.0` | Wide compatibility at no cost; the token layer needs nothing newer. |

## Learning

- What the human wants to understand: `None`
- Preferred lesson format: `TBD`
