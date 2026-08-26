# Afterglow

An Obsidian theme with two modes that are two expressions of one identity —
**Pastel Archive** in light, **Ultraviolet Library** in dark. Same typography,
spacing, borders and shapes; only the color values change.

![Afterglow](screenshot.png)

> **Status: in development.** The token system and both modes are in place.
> Per-surface refinement — callouts, tables, code blocks, graph, command
> palette — and the automated check suite are still to come.

## Install

Afterglow is not in the community directory yet. To install it manually:

1. Copy or symlink this repository into your vault at
   `.obsidian/themes/Afterglow`. **The directory name must be exactly
   `Afterglow`** — it has to match `name` in `manifest.json`, or Obsidian will
   not detect the theme.
2. In Obsidian, open **Settings → Appearance → Themes** and select
   **Afterglow**.
3. Switch **Base color scheme** between Light and Dark to move between Pastel
   Archive and Ultraviolet Library.

Symlinking a clone into a test vault is the quickest development setup:

```sh
ln -s "$PWD" /path/to/vault/.obsidian/themes/Afterglow
```

Obsidian reloads a theme when its `theme.css` changes, so a rebuild shows up
without restarting the app.

## Development

Requires Node 18 or newer. The tooling is development-only — no JavaScript and
no dependency ships with the theme.

```sh
npm ci           # install dev tooling
npm run build    # concatenate src/*.css into theme.css
npm test         # run the check suite, then the negative cases
npm run lint     # stylelint on its own, with CLI output
```

Author CSS in `src/`. Modules are concatenated in filename order, so the
numeric prefix is the cascade order. **`theme.css` is generated and committed —
never edit it by hand**; it is committed because Obsidian and the community
directory read it directly from the repository.

| Module | Layer |
| --- | --- |
| `01-shared.css` | Everything that is not a color, defined once for both modes |
| `02-palette.css` | Raw values, per mode. Never referenced outside layer 2 |
| `03-roles.css` | Semantic roles — shared names, mode-specific values |
| `04-obsidian.css` | Roles assigned to Obsidian's own CSS variables |
| `05-motion.css` | `prefers-reduced-motion` |

A color flows palette → role → Obsidian variable. Component styling consumes
roles only; if a component needs a color with no role, the fix is a new role
defined in **both** modes, not a raw value.

To confirm the stylesheet is loaded rather than merely listed, open the
developer console with the theme selected and run:

```js
getComputedStyle(document.body).getPropertyValue('--ag-theme') // "afterglow"
```

## Checks

A theme has no unit-testable logic, so the suite verifies the shipped artifact.
`npm test` runs nine checks and then fourteen negative cases:

| Check | Fails when |
| --- | --- |
| `required-files` | a release file is missing, or the screenshot is not 512×288 |
| `manifest` | a required key is missing, a plugin-only key is present, or the version is not strict semver |
| `build-sync` | the committed `theme.css` is not what `src/` builds |
| `css-validity` | stylelint reports a parse error or rule violation |
| `css-policy` | a remote asset, an `!important`, or a `:root` selector appears |
| `token-parity` | a semantic role exists in one mode only, or resolves to nothing |
| `contrast` | any text/background pair falls below WCAG AA |
| `surface-separation` | two adjacent grounds are indistinguishable in both lightness and hue |
| `hue-coordination` | a light role drifts to a different hue family than its dark counterpart |

The last two exist because of a defect the others could not see. An early
Pastel Archive passed contrast and parity comfortably and still had to be
rejected on sight: its surfaces were separated in lightness but shared one warm
neutral hue, so the mode read as sepia. `hue-coordination` now catches that
regression as a 139° drift.

`npm run check:negative` copies the repository to a throwaway directory, breaks
one thing, and asserts the responsible check reports it. A check nobody has
seen fail is not evidence, so adding a check without a negative case fails the
run.

## Design rules

These are constraints, not preferences:

- No `!important` anywhere — it blocks users' own CSS snippets.
- No remote assets and no network calls. System and local font stacks only.
- Obsidian's CSS variables are overridden under `body`, `.theme-light` and
  `.theme-dark`; documented variables are preferred over selectors.
- Every semantic role is defined in both modes.
- Body text and essential controls meet WCAG AA in both modes, verified by an
  automated check rather than by eye.
- Color carries hierarchy, semantics and interaction — never body paragraphs.
  Dark-mode glow is limited to the focus ring, caret, active tab, links and
  graph nodes.

## License

[MIT](LICENSE).
