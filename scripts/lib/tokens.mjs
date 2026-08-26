/**
 * Read the shipped stylesheet and resolve its tokens per mode.
 *
 * Every color check works from the built theme.css rather than from src/, so
 * what is verified is what Obsidian actually loads. A check that reads its
 * inputs from the same place the author typed them proves very little.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const ROLE_PREFIX = '--ag-';
export const PALETTE_PREFIX = '--ag-palette-';

/**
 * Strip comments and @media blocks, then index declarations by selector.
 *
 * Comments sit between every rule in this stylesheet, so any parser that
 * anchors on a preceding brace silently collects nothing — which is a failure
 * mode that looks exactly like a passing check.
 */
function declarationsBySelector(css) {
  const flat = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');

  const bySelector = new Map();
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = rule.exec(flat))) {
    const selector = match[1].trim();
    const target = bySelector.get(selector) ?? {};
    for (const declaration of match[2].split(';')) {
      const colon = declaration.indexOf(':');
      if (colon === -1) continue;
      const property = declaration.slice(0, colon).trim();
      if (!property.startsWith('--')) continue;
      target[property] = declaration.slice(colon + 1).trim();
    }
    bySelector.set(selector, target);
  }
  return bySelector;
}

/**
 * Load theme.css and return the two modes plus a resolver.
 *
 * `resolve` follows var() chains within a mode, falling back to the shared
 * body block, so a role defined as var(--ag-palette-x) comes back as the hex
 * value a reader would actually see.
 */
export function loadTheme(root) {
  const css = readFileSync(join(root, 'theme.css'), 'utf8');
  const bySelector = declarationsBySelector(css);
  const body = bySelector.get('body') ?? {};
  const modes = {
    light: bySelector.get('.theme-light') ?? {},
    dark: bySelector.get('.theme-dark') ?? {},
  };

  function resolve(name, modeName, depth = 0) {
    if (depth > 20) throw new Error(`var() cycle resolving ${name}`);
    const raw = modes[modeName][name] ?? body[name];
    if (raw === undefined) return undefined;
    const reference = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    return reference ? resolve(reference[1], modeName, depth + 1) : raw;
  }

  const rolesIn = (modeName) =>
    Object.keys(modes[modeName])
      .filter((n) => n.startsWith(ROLE_PREFIX) && !n.startsWith(PALETTE_PREFIX))
      .sort();

  return { css, body, modes, resolve, rolesIn };
}

export const MODES = [
  ['light', 'Pastel Archive'],
  ['dark', 'Ultraviolet Library'],
];
