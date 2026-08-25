# Afterglow

An Obsidian theme with two modes that are two expressions of one identity —
**Pastel Archive** in light, **Ultraviolet Library** in dark. Same typography,
spacing, borders and shapes; only the color values change.

![Afterglow](screenshot.png)

> **Status: in development.** The installable skeleton is in place. The token
> system and both palettes are not implemented yet, so the theme currently
> renders Obsidian's default appearance.

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
npm run build    # concatenate src/*.css into theme.css
```

Author CSS in `src/`. Modules are concatenated in filename order, so the
numeric prefix is the cascade order. **`theme.css` is generated and committed —
never edit it by hand**; it is committed because Obsidian and the community
directory read it directly from the repository.

To confirm the stylesheet is loaded rather than merely listed, open the
developer console with the theme selected and run:

```js
getComputedStyle(document.body).getPropertyValue('--ag-theme') // "afterglow"
```

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
