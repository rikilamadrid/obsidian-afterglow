/**
 * manifest.json must satisfy Obsidian's theme submission rules.
 *
 * The plugin-only keys matter as much as the required ones: a theme manifest
 * carrying `id` or `description` is a common submission rejection.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED_KEYS = ['name', 'version', 'minAppVersion', 'author'];
const FORBIDDEN_KEYS = ['id', 'description'];
const SEMVER = /^\d+\.\d+\.\d+$/;
const EXPECTED_NAME = 'Afterglow';

export const name = 'manifest';

export function run(root) {
  const failures = [];
  const notes = [];

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  } catch (error) {
    return { ok: false, failures: [`manifest.json is unreadable or invalid JSON — ${error.message}`], notes };
  }

  for (const key of REQUIRED_KEYS) {
    const value = manifest[key];
    if (typeof value !== 'string' || value.trim() === '') {
      failures.push(`missing or empty required key: ${key}`);
    }
  }

  for (const key of FORBIDDEN_KEYS) {
    if (key in manifest) {
      failures.push(`plugin-only key present: ${key} (themes must not declare it)`);
    }
  }

  // The theme directory in a vault must equal this name exactly or Obsidian
  // will not detect the theme at all, and it cannot be changed after listing.
  if (manifest.name !== undefined && manifest.name !== EXPECTED_NAME) {
    failures.push(`name is "${manifest.name}", must be "${EXPECTED_NAME}"`);
  }

  if (manifest.version !== undefined && !SEMVER.test(manifest.version)) {
    failures.push(`version "${manifest.version}" is not strict semver x.y.z`);
  }

  if (manifest.minAppVersion !== undefined && !SEMVER.test(manifest.minAppVersion)) {
    failures.push(`minAppVersion "${manifest.minAppVersion}" is not strict semver x.y.z`);
  }

  if (failures.length === 0) {
    notes.push(`${manifest.name} v${manifest.version}, minAppVersion ${manifest.minAppVersion}`);
  }
  return { ok: failures.length === 0, failures, notes };
}
