/**
 * Adjacent grounds must be distinguishable from each other.
 *
 * This check exists because of a real defect no other check could see. The
 * first Pastel Archive passed contrast and parity comfortably, and still had
 * to be rejected on sight: its sidebar, editor and tab strip were separated in
 * lightness but were all the same warm neutral hue, so the mode read as sepia
 * rather than as a pastel theme.
 *
 * Two grounds therefore count as separated if they differ enough in EITHER
 * lightness or hue. Reporting both numbers is the point — a pair that passes
 * on hue alone is a deliberate design choice worth seeing.
 */

import { contrast, hue, hueDistance, isHex } from '../lib/color.mjs';
import { loadTheme, MODES } from '../lib/tokens.mjs';

const MIN_RATIO = 1.03; // luminance separation
const MIN_HUE = 15; // degrees, when lightness alone is not enough

const ADJACENT = [
  ['--ag-bg-page', '--ag-bg-surface'],
  ['--ag-bg-surface', '--ag-bg-elevated'],
  ['--ag-bg-page', '--ag-bg-elevated'],
  ['--ag-bg-surface', '--ag-bg-hover'],
  // Form fields sit on surface panels — sidebar search, settings — not on the
  // reading canvas, so surface is the adjacency that actually occurs. On the
  // page ground a field is delineated by its border, not by its fill.
  ['--ag-bg-surface', '--ag-bg-form'],
];

export const name = 'surface-separation';

export function run(root) {
  const { resolve } = loadTheme(root);
  const failures = [];
  const notes = [];
  let checked = 0;

  for (const [mode, label] of MODES) {
    for (const [aName, bName] of ADJACENT) {
      const a = resolve(aName, mode);
      const b = resolve(bName, mode);

      if (!isHex(a) || !isHex(b)) {
        failures.push(`${label}: ${aName} / ${bName} — missing or non-hex ground`);
        continue;
      }

      const ratio = contrast(a, b);
      const hueGap = hueDistance(a, b);
      checked++;

      if (ratio < MIN_RATIO && hueGap < MIN_HUE) {
        failures.push(
          `${label}: ${aName.replace('--ag-bg-', '')} / ${bName.replace('--ag-bg-', '')} — ` +
            `indistinguishable: ${ratio.toFixed(3)} lightness ratio (needs ${MIN_RATIO}) ` +
            `and ${hueGap}° hue gap (needs ${MIN_HUE}°). ` +
            `${a} h${hue(a)} vs ${b} h${hue(b)}`,
        );
      }
    }
  }

  if (failures.length === 0) notes.push(`${checked} adjacent ground pairs distinguishable`);
  return { ok: failures.length === 0, failures, notes };
}
