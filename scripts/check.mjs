/**
 * Run every check against the repository and report.
 *
 * A theme has no unit-testable logic, so this suite verifies the shipped
 * artifact instead: that the files exist, that the manifest is valid, that
 * theme.css is what src/ builds, and that the tokens inside it are in parity,
 * legible, distinguishable and coordinated across modes.
 *
 * Usage:
 *   node scripts/check.mjs              check this repository
 *   node scripts/check.mjs <directory>  check a copy elsewhere
 *   node scripts/check.mjs --only=name  run one check by name
 *
 * What it cannot do is tell you the theme looks right. That needs a real vault.
 */

import { join, dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as requiredFiles from './checks/required-files.mjs';
import * as manifest from './checks/manifest.mjs';
import * as buildSync from './checks/build-sync.mjs';
import * as cssPolicy from './checks/css-policy.mjs';
import * as cssValidity from './checks/css-validity.mjs';
import * as tokenParity from './checks/token-parity.mjs';
import * as contrast from './checks/contrast.mjs';
import * as surfaceSeparation from './checks/surface-separation.mjs';
import * as hueCoordination from './checks/hue-coordination.mjs';

export const CHECKS = [
  requiredFiles,
  manifest,
  buildSync,
  cssValidity,
  cssPolicy,
  tokenParity,
  contrast,
  surfaceSeparation,
  hueCoordination,
];

/**
 * Run the checks against `root`.
 *
 * A check that throws is reported as a failure rather than crashing the run:
 * one broken input should not hide the state of every other check.
 */
export async function runAll(root, only = null) {
  const selected = CHECKS.filter((check) => !only || check.name === only);
  const results = [];
  for (const check of selected) {
    try {
      results.push({ name: check.name, ...(await check.run(root)) });
    } catch (error) {
      results.push({ name: check.name, ok: false, failures: [`threw: ${error.message}`], notes: [] });
    }
  }
  return results;
}

function report(results) {
  for (const result of results) {
    console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`);
    for (const note of result.notes) console.log(`        ${note}`);
    for (const failure of result.failures) console.log(`      ! ${failure}`);
  }
  const failed = results.filter((r) => !r.ok);
  console.log('');
  console.log(
    failed.length === 0
      ? `All ${results.length} checks passed.`
      : `${failed.length} of ${results.length} checks failed: ${failed.map((f) => f.name).join(', ')}`,
  );
  return failed.length === 0;
}

// Only run when invoked directly, so the negative harness can import CHECKS.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length) ?? null;
  const target = args.find((a) => !a.startsWith('--'));
  const root = target
    ? resolvePath(target)
    : join(dirname(fileURLToPath(import.meta.url)), '..');

  if (only && !CHECKS.some((c) => c.name === only)) {
    console.error(`Unknown check: ${only}`);
    console.error(`Available: ${CHECKS.map((c) => c.name).join(', ')}`);
    process.exit(2);
  }

  process.exit(report(await runAll(root, only)) ? 0 : 1);
}
