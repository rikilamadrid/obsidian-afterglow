/**
 * Color math for the check suite.
 *
 * WCAG 2.1 relative luminance and contrast, plus hue — which Afterglow needs
 * because the difference between "Pastel Archive" and "sepia Obsidian" is a
 * hue difference that no contrast ratio can see.
 */

/** Undo the sRGB transfer function for one 0-255 channel. */
function toLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Parse #rgb or #rrggbb into [r, g, b], each 0-255. */
export function parseHex(value) {
  const hex = String(value).trim().replace('#', '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Not a hex color: ${value}`);
  }
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

/** True when a value is a hex color the contrast checks can reason about. */
export function isHex(value) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value).trim());
}

export function luminance(hex) {
  const [r, g, b] = parseHex(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1 to 21. Order of arguments does not matter. */
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

/** Hue in degrees, 0-359. Achromatic values return 0. */
export function hue(hex) {
  const [r, g, b] = parseHex(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return 0;
  const h =
    max === r
      ? 60 * (((g - b) / delta) % 6)
      : max === g
        ? 60 * ((b - r) / delta + 2)
        : 60 * ((r - g) / delta + 4);
  return Math.round((h + 360) % 360);
}

/** Shortest distance between two hues on the wheel, 0-180 degrees. */
export function hueDistance(a, b) {
  const d = Math.abs(hue(a) - hue(b));
  return Math.min(d, 360 - d);
}
