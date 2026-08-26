/**
 * Both modes must define exactly the same semantic roles.
 *
 * A role present in one mode and absent from the other is the defect that lets
 * the two modes drift apart: a consumer of that role silently falls back, or
 * renders nothing, in whichever mode forgot it.
 */

import { loadTheme } from '../lib/tokens.mjs';

export const name = 'token-parity';

export function run(root) {
  const { modes, resolve, rolesIn } = loadTheme(root);
  const failures = [];

  const light = rolesIn('light');
  const dark = rolesIn('dark');

  if (light.length === 0 || dark.length === 0) {
    return {
      ok: false,
      failures: [
        `no roles found in ${light.length === 0 ? '.theme-light' : '.theme-dark'} — ` +
          'theme.css is empty, unbuilt, or its structure changed',
      ],
      notes: [],
    };
  }

  for (const role of light) {
    if (!dark.includes(role)) failures.push(`defined only in Pastel Archive: ${role}`);
  }
  for (const role of dark) {
    if (!light.includes(role)) failures.push(`defined only in Ultraviolet Library: ${role}`);
  }

  // A role that resolves to nothing is as broken as a missing one, and a
  // typo'd var() reference is exactly how that happens.
  for (const [mode, label] of [['light', 'Pastel Archive'], ['dark', 'Ultraviolet Library']]) {
    for (const role of Object.keys(modes[mode]).filter((r) => light.includes(r) || dark.includes(r))) {
      if (resolve(role, mode) === undefined) {
        failures.push(`${label}: ${role} does not resolve to a value`);
      }
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    notes: failures.length === 0 ? [`${light.length} roles, identical sets in both modes`] : [],
  };
}
