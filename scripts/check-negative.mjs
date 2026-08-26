/**
 * Prove every check can fail.
 *
 * A check that has only ever seen a healthy repository is not evidence. Each
 * case below copies the repository to a throwaway directory, breaks exactly one
 * thing, and asserts that the check responsible reports it. The working tree is
 * never modified.
 *
 * Where a case breaks a token, it edits src/ and rebuilds, so the failure is
 * attributed to the check under test rather than to build-sync catching drift.
 *
 * Usage:
 *   node scripts/check-negative.mjs           run all cases
 *   node scripts/check-negative.mjs --verbose show the failure text produced
 */

import { cpSync, mkdtempSync, rmSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runAll, CHECKS } from './check.mjs';
import { buildCss } from './lib/build.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const verbose = process.argv.includes('--verbose');

/** Everything a check needs to run. node_modules and .git are irrelevant. */
const COPIED = ['src', 'scripts', 'manifest.json', 'theme.css', 'README.md', 'LICENSE', 'screenshot.png'];

const edit = (root, file, from, to) => {
  const path = join(root, file);
  const before = readFileSync(path, 'utf8');
  if (!before.includes(from)) {
    throw new Error(`negative case is stale: ${JSON.stringify(from)} not found in ${file}`);
  }
  writeFileSync(path, before.replace(from, to), 'utf8');
};

const rebuild = (root) => writeFileSync(join(root, 'theme.css'), buildCss(root), 'utf8');

const CASES = [
  {
    name: 'a required file is missing',
    expect: 'required-files',
    apply: (root) => unlinkSync(join(root, 'LICENSE')),
  },
  {
    name: 'the screenshot is the wrong size',
    expect: 'required-files',
    // A 1x1 PNG: right format, wrong dimensions for the directory listing.
    apply: (root) =>
      writeFileSync(
        join(root, 'screenshot.png'),
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          'base64',
        ),
      ),
  },
  {
    name: 'the manifest carries a plugin-only key',
    expect: 'manifest',
    apply: (root) => edit(root, 'manifest.json', '"name": "Afterglow"', '"id": "afterglow",\n  "name": "Afterglow"'),
  },
  {
    name: 'the manifest version is not strict semver',
    expect: 'manifest',
    apply: (root) => edit(root, 'manifest.json', '"version": "0.1.0"', '"version": "0.1"'),
  },
  {
    name: 'theme.css does not match src/',
    expect: 'build-sync',
    apply: (root) => writeFileSync(join(root, 'theme.css'), `${readFileSync(join(root, 'theme.css'), 'utf8')}\nbody { color: red; }\n`),
  },
  {
    name: 'a remote asset is referenced',
    expect: 'css-policy',
    apply: (root) => {
      edit(root, 'src/01-shared.css', 'body {', "@import url('https://fonts.example.com/x.css');\n\nbody {");
      rebuild(root);
    },
  },
  {
    name: 'an !important declaration is added',
    expect: 'css-policy',
    apply: (root) => {
      edit(root, 'src/01-shared.css', '--ag-border-width: 1px;', '--ag-border-width: 1px !important;');
      rebuild(root);
    },
  },
  {
    name: 'a :root selector is used',
    expect: 'css-policy',
    apply: (root) => {
      edit(root, 'src/01-shared.css', 'body {', ':root {\n  --ag-leak: 1;\n}\n\nbody {');
      rebuild(root);
    },
  },
  {
    name: 'the CSS is syntactically invalid',
    expect: 'css-validity',
    apply: (root) => {
      edit(root, 'src/05-motion.css', '@media (prefers-reduced-motion: reduce) {', '@media (prefers-reduced-motion: reduce) {{');
      rebuild(root);
    },
  },
  {
    name: 'the role layer declares a non-Afterglow property',
    expect: 'css-validity',
    // The layering constraint: only the mapping layer may declare anything
    // that is not an --ag-* token.
    apply: (root) => {
      edit(root, 'src/03-roles.css', '  --ag-bg-page: var(--ag-palette-ivory);', '  --nav-item-color: red;\n  --ag-bg-page: var(--ag-palette-ivory);');
      rebuild(root);
    },
  },
  {
    name: 'a role is defined in only one mode',
    expect: 'token-parity',
    apply: (root) => {
      edit(root, 'src/03-roles.css', '  --ag-bg-page-alt: var(--ag-palette-violet-wash);\n', '');
      rebuild(root);
    },
  },
  {
    name: 'body text falls below AA',
    expect: 'contrast',
    apply: (root) => {
      edit(root, 'src/02-palette.css', '--ag-palette-ink: #27242a;', '--ag-palette-ink: #b9b3bd;');
      rebuild(root);
    },
  },
  {
    name: 'two adjacent surfaces become indistinguishable',
    expect: 'surface-separation',
    apply: (root) => {
      edit(root, 'src/02-palette.css', '--ag-palette-violet-pale: #efe7ff;', '--ag-palette-violet-pale: #fff9f2;');
      rebuild(root);
    },
  },
  {
    name: 'the light mode drifts back to sepia',
    expect: 'hue-coordination',
    // The exact regression a human caught by eye in chunk 2: contrast and
    // parity both stayed green while the mode stopped being Pastel Archive.
    apply: (root) => {
      edit(root, 'src/02-palette.css', '--ag-palette-violet-pale: #efe7ff;', '--ag-palette-violet-pale: #f6eee4;');
      edit(root, 'src/02-palette.css', '--ag-palette-violet-soft: #e4dcfa;', '--ag-palette-violet-soft: #efe5d9;');
      rebuild(root);
    },
  },
];

async function runCase(testCase) {
  const root = mkdtempSync(join(tmpdir(), 'afterglow-negative-'));
  try {
    for (const entry of COPIED) {
      cpSync(join(repoRoot, entry), join(root, entry), { recursive: true });
    }
    testCase.apply(root);

    const results = await runAll(root);
    const failed = results.filter((r) => !r.ok).map((r) => r.name);
    const caught = failed.includes(testCase.expect);

    const detail = results.find((r) => r.name === testCase.expect);
    return { caught, failed, detail };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

let broken = 0;
console.log('Negative tests — each breaks one thing and expects the responsible check to catch it.\n');

// A check with no negative case is a check nobody has ever seen fail. Adding
// one to the suite without proving it can fail should not be possible quietly.
const uncovered = CHECKS.map((c) => c.name).filter((n) => !CASES.some((c) => c.expect === n));
if (uncovered.length) {
  console.log(`FAIL  coverage — no negative case for: ${uncovered.join(', ')}\n`);
  broken += uncovered.length;
}

for (const testCase of CASES) {
  const { caught, failed, detail } = await runCase(testCase);
  if (!caught) broken++;

  console.log(`${caught ? 'PASS' : 'FAIL'}  ${testCase.expect.padEnd(19)} ${testCase.name}`);
  if (!caught) {
    console.log(`      ! ${testCase.expect} did not report a failure`);
    console.log(`        checks that did fail: ${failed.length ? failed.join(', ') : 'none'}`);
  } else if (verbose) {
    for (const line of detail.failures.slice(0, 3)) console.log(`        > ${line}`);
    const collateral = failed.filter((f) => f !== testCase.expect);
    if (collateral.length) console.log(`        also failed: ${collateral.join(', ')}`);
  }
}

console.log('');
console.log(
  broken === 0
    ? `All ${CASES.length} negative cases caught.`
    : `${broken} of ${CASES.length} negative cases were NOT caught.`,
);
process.exit(broken === 0 ? 0 : 1);
