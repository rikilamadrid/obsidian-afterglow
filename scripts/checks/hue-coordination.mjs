/**
 * The two modes must be the same hues at different lightness.
 *
 * This is the product thesis expressed as a number. "Pastel Archive is
 * Ultraviolet Library seen in daylight" is only true if each light role sits on
 * the same part of the color wheel as its dark counterpart; if the light accent
 * drifts to a different hue family, the two modes become two themes that happen
 * to ship together.
 *
 * Grounds are given more latitude than accents: a near-black and a near-white
 * carry so little chroma that their measured hue is unstable.
 */

import { hue, hueDistance, isHex } from '../lib/color.mjs';
import { loadTheme } from '../lib/tokens.mjs';

const COORDINATED = [
  ['--ag-accent-interactive', 8],
  ['--ag-link', 12],
  ['--ag-success', 12],
  ['--ag-warning', 12],
  ['--ag-error', 12],
  ['--ag-selection', 15],
  ['--ag-bg-surface', 15],
  ['--ag-bg-elevated', 15],
  ['--ag-bg-hover', 15],
];

export const name = 'hue-coordination';

export function run(root) {
  const { resolve } = loadTheme(root);
  const failures = [];
  const notes = [];
  let widest = { gap: -1, label: '' };

  for (const [role, maxGap] of COORDINATED) {
    const light = resolve(role, 'light');
    const dark = resolve(role, 'dark');

    if (!isHex(light) || !isHex(dark)) {
      failures.push(`${role} — missing or non-hex in one mode`);
      continue;
    }

    const gap = hueDistance(light, dark);
    if (gap > maxGap) {
      failures.push(
        `${role.replace('--ag-', '')} — ${gap}° apart, allowed ${maxGap}°: ` +
          `light ${light} h${hue(light)} vs dark ${dark} h${hue(dark)}`,
      );
    } else if (gap > widest.gap) {
      widest = { gap, label: role.replace('--ag-', '') };
    }
  }

  if (failures.length === 0) {
    notes.push(`${COORDINATED.length} roles hue-coordinated across modes`);
    notes.push(`widest gap: ${widest.label} at ${widest.gap}°`);
  }
  return { ok: failures.length === 0, failures, notes };
}
