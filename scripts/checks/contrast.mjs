/**
 * WCAG AA contrast over the text and background roles, in both modes.
 *
 * Text is checked against every ground a reader can land on, not only the
 * reading canvas. Once sidebars and tabs carry the identity hue, UI text sits
 * on colored surfaces routinely — and a pair that passes on ivory can fail on
 * the elevated ground, which is exactly what happened to the link color.
 */

import { contrast, isHex } from '../lib/color.mjs';
import { loadTheme, MODES } from '../lib/tokens.mjs';

const AA_TEXT = 4.5;
const AA_LARGE = 3; // large text and non-text UI components

/** Grounds that can sit behind text. */
const GROUNDS = [
  '--ag-bg-page',
  '--ag-bg-page-alt',
  '--ag-bg-surface',
  '--ag-bg-elevated',
  '--ag-bg-hover',
  '--ag-bg-form',
  '--ag-selection',
  '--ag-highlight',
];

/** Grounds that carry interactive text (links, accents) as well as body text. */
const INTERACTIVE_GROUNDS = GROUNDS.slice(0, 6);

const STATES = ['info', 'success', 'warning', 'error'];

export const PAIRS = [
  ...GROUNDS.flatMap((ground) => [
    ['--ag-text-body', ground, AA_TEXT],
    ['--ag-text-muted', ground, AA_TEXT],
  ]),
  ...INTERACTIVE_GROUNDS.flatMap((ground) => [
    ['--ag-link', ground, AA_TEXT],
    ['--ag-accent-interactive', ground, AA_TEXT],
  ]),
  // Faint text is supporting information, held to the large-text threshold.
  ['--ag-text-faint', '--ag-bg-page', AA_LARGE],
  ['--ag-text-faint', '--ag-bg-surface', AA_LARGE],
  ['--ag-text-faint', '--ag-bg-elevated', AA_LARGE],
  ['--ag-text-heading', '--ag-bg-page', AA_TEXT],
  ['--ag-link-hover', '--ag-bg-page', AA_TEXT],
  ['--ag-accent-interactive-hover', '--ag-bg-page', AA_TEXT],
  ['--ag-text-on-accent', '--ag-accent-interactive', AA_TEXT],
  // The focus ring is a non-text UI component.
  ['--ag-focus-ring', '--ag-bg-page', AA_LARGE],
  ['--ag-focus-ring', '--ag-bg-surface', AA_LARGE],
  ['--ag-focus-ring', '--ag-bg-elevated', AA_LARGE],
  ...STATES.flatMap((state) => [
    [`--ag-${state}`, '--ag-bg-page', AA_TEXT],
    [`--ag-${state}`, `--ag-${state}-surface`, AA_TEXT],
    ['--ag-text-body', `--ag-${state}-surface`, AA_TEXT],
  ]),
];

export const name = 'contrast';

export function run(root) {
  const { resolve } = loadTheme(root);
  const failures = [];
  const notes = [];
  let checked = 0;
  let narrowest = { ratio: Infinity, label: '' };

  for (const [mode, label] of MODES) {
    for (const [fgName, bgName, min] of PAIRS) {
      const fg = resolve(fgName, mode);
      const bg = resolve(bgName, mode);

      if (fg === undefined || bg === undefined) {
        failures.push(`${label}: ${fgName} on ${bgName} — role missing`);
        continue;
      }
      if (!isHex(fg) || !isHex(bg)) {
        failures.push(
          `${label}: ${fgName} on ${bgName} — not a hex color (${!isHex(fg) ? fg : bg})`,
        );
        continue;
      }

      const ratio = contrast(fg, bg);
      checked++;
      const pair = `${label}: ${fgName.replace('--ag-', '')} on ${bgName.replace('--ag-', '')}`;
      if (ratio < min) {
        failures.push(`${pair} — ${ratio.toFixed(2)}:1, needs ${min}:1 (${fg} on ${bg})`);
        continue;
      }
      // Report the smallest surviving margin, so the pair most likely to break
      // under the next palette change is visible without reading 100 lines.
      const margin = ratio - min;
      if (margin < narrowest.ratio) narrowest = { ratio: margin, label: pair, actual: ratio, min };
    }
  }

  if (failures.length === 0) {
    notes.push(`${checked} pairs at WCAG AA`);
    notes.push(
      `smallest margin: ${narrowest.label} at ${narrowest.actual.toFixed(2)}:1 ` +
        `(needs ${narrowest.min}:1)`,
    );
  }
  return { ok: failures.length === 0, failures, notes };
}
