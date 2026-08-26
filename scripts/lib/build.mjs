/**
 * Build theme.css by concatenating the CSS modules in src/.
 *
 * Modules are concatenated in filename order, so the numeric prefix is the
 * cascade order: shared foundation, palette, semantic roles, Obsidian variable
 * mapping, motion.
 *
 * theme.css is generated and committed, because Obsidian and the community
 * directory read it directly from the repository.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** CSS module filenames in cascade order. */
export function moduleNames(root) {
  const modules = readdirSync(join(root, 'src'))
    .filter((file) => file.endsWith('.css'))
    .sort();
  if (modules.length === 0) throw new Error(`No CSS modules found in ${join(root, 'src')}`);
  return modules;
}

/**
 * Concatenate the modules into the full stylesheet.
 *
 * The banner carries no build date deliberately: a timestamp would make every
 * rebuild a diff, and the sync check needs output to depend only on input.
 */
export function buildCss(root) {
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));

  const banner = [
    '/*',
    ` * ${manifest.name} v${manifest.version}`,
    ' *',
    ' * Generated from src/ by scripts/build.mjs. Do not edit by hand.',
    ' * Edit the modules in src/ and run: npm run build',
    ' */',
    '',
  ].join('\n');

  const parts = moduleNames(root).map((file) => {
    const css = readFileSync(join(root, 'src', file), 'utf8');
    return `/* ===== src/${file} ===== */\n\n${css.trimEnd()}\n`;
  });

  return `${banner}\n${parts.join('\n')}`;
}
