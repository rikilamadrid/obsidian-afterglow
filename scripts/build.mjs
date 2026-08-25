/**
 * Build theme.css by concatenating the CSS modules in src/.
 *
 * Modules are concatenated in filename order, so the numeric prefix is the
 * cascade order: palette, then semantic roles, then the Obsidian variable
 * mapping, then component styling.
 *
 * theme.css is generated and committed, because Obsidian and the community
 * directory read it directly from the repository. Never edit it by hand.
 *
 * Usage:
 *   node scripts/build.mjs            write theme.css
 *   node scripts/build.mjs --check    exit non-zero if theme.css is stale
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(repoRoot, 'src');
const outFile = join(repoRoot, 'theme.css');

/** Read manifest.json for the banner. Fails loudly if it is missing or invalid. */
async function readManifest() {
  const raw = await readFile(join(repoRoot, 'manifest.json'), 'utf8');
  return JSON.parse(raw);
}

/** CSS module filenames in cascade order. */
async function moduleNames() {
  const entries = await readdir(srcDir);
  const modules = entries.filter((name) => name.endsWith('.css')).sort();
  if (modules.length === 0) {
    throw new Error(`No CSS modules found in ${srcDir}`);
  }
  return modules;
}

/**
 * Concatenate the modules into the full stylesheet.
 *
 * The banner carries no build date: a timestamp would make every rebuild a
 * diff, and the theme.css-matches-src check needs the output to depend only
 * on the input.
 */
async function buildCss() {
  const manifest = await readManifest();
  const modules = await moduleNames();

  const banner = [
    '/*',
    ` * ${manifest.name} v${manifest.version}`,
    ' *',
    ' * Generated from src/ by scripts/build.mjs. Do not edit by hand.',
    ' * Edit the modules in src/ and run: npm run build',
    ' */',
    '',
  ].join('\n');

  const parts = [];
  for (const name of modules) {
    const css = await readFile(join(srcDir, name), 'utf8');
    parts.push(`/* ===== src/${name} ===== */\n\n${css.trimEnd()}\n`);
  }

  return `${banner}\n${parts.join('\n')}`;
}

const css = await buildCss();

if (process.argv.includes('--check')) {
  let current = null;
  try {
    current = await readFile(outFile, 'utf8');
  } catch {
    console.error('theme.css is missing. Run: npm run build');
    process.exit(1);
  }
  if (current !== css) {
    console.error('theme.css does not match src/. Run: npm run build');
    process.exit(1);
  }
  console.log('theme.css matches src/.');
} else {
  await writeFile(outFile, css, 'utf8');
  console.log(`Wrote theme.css from ${(await moduleNames()).length} module(s).`);
}
