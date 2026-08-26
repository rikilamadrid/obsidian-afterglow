/**
 * Obsidian's theme policy, and Afterglow's own, as scans over src/ and the
 * built stylesheet.
 *
 * Remote references are a submission blocker and a privacy problem. !important
 * blocks users' own CSS snippets. :root reaches past the mode classes, which is
 * how a value ends up shared that should have differed between modes.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RULES = [
  {
    id: 'remote-assets',
    // url() is included because a local url() would still be an asset
    // reference, and the theme ships no assets at all.
    pattern: /https?:\/\/|@import|url\(/gi,
    message: 'remote or external asset reference',
  },
  {
    id: 'important',
    pattern: /!\s*important/gi,
    message: '!important declaration',
  },
  {
    id: 'root-selector',
    pattern: /:root\b/g,
    message: ':root selector (override under body, .theme-light or .theme-dark)',
  },
];

function cssFiles(root) {
  const files = [{ label: 'theme.css', path: join(root, 'theme.css') }];
  for (const file of readdirSync(join(root, 'src')).filter((f) => f.endsWith('.css')).sort()) {
    files.push({ label: `src/${file}`, path: join(root, 'src', file) });
  }
  return files;
}

export const name = 'css-policy';

export function run(root) {
  const failures = [];

  for (const { label, path } of cssFiles(root)) {
    const lines = readFileSync(path, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(line)) {
          failures.push(`${label}:${index + 1} — ${rule.message}: ${line.trim()}`);
        }
      }
    });
  }

  return {
    ok: failures.length === 0,
    failures,
    notes: failures.length === 0 ? ['no remote assets, no !important, no :root'] : [],
  };
}
