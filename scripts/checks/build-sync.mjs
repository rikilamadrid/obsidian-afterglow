/**
 * The committed theme.css must be exactly what src/ builds.
 *
 * theme.css is the file Obsidian loads, so drift between it and src/ means the
 * reviewed source and the shipped artifact are different stylesheets.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildCss } from '../lib/build.mjs';

export const name = 'build-sync';

export function run(root) {
  let expected;
  try {
    expected = buildCss(root);
  } catch (error) {
    return { ok: false, failures: [`cannot build from src/ — ${error.message}`], notes: [] };
  }

  let actual;
  try {
    actual = readFileSync(join(root, 'theme.css'), 'utf8');
  } catch {
    return { ok: false, failures: ['theme.css is missing. Run: npm run build'], notes: [] };
  }

  if (actual === expected) {
    return { ok: true, failures: [], notes: ['theme.css matches src/'] };
  }

  // Point at the first divergent line: "they differ" is not actionable on a
  // 500-line generated file.
  const a = actual.split('\n');
  const b = expected.split('\n');
  let line = 0;
  while (line < Math.max(a.length, b.length) && a[line] === b[line]) line++;

  return {
    ok: false,
    failures: [
      'theme.css does not match src/. Run: npm run build',
      `  first difference at line ${line + 1}`,
      `    committed: ${JSON.stringify(a[line] ?? '<end of file>')}`,
      `    from src/: ${JSON.stringify(b[line] ?? '<end of file>')}`,
    ],
    notes: [],
  };
}
