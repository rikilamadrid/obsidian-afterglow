/**
 * Write theme.css from the modules in src/.
 *
 * Usage:
 *   node scripts/build.mjs            write theme.css
 *   node scripts/build.mjs --check    exit non-zero if theme.css is stale
 *
 * The --check form is also available as part of `npm test`, via
 * scripts/checks/build-sync.mjs.
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCss, moduleNames } from './lib/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'theme.css');
const css = buildCss(root);

if (process.argv.includes('--check')) {
  let current = null;
  try {
    current = readFileSync(outFile, 'utf8');
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
  writeFileSync(outFile, css, 'utf8');
  console.log(`Wrote theme.css from ${moduleNames(root).length} module(s).`);
}
