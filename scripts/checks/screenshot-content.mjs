/**
 * Reject the known flat listing placeholder without claiming image provenance.
 *
 * required-files owns PNG validity and the required 512x288 dimensions. This
 * check applies the Feature 02 content heuristic only: a real capture must be
 * substantially larger than the original 879-byte flat ivory PNG.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIN_SCREENSHOT_BYTES = 10_000;

export const name = 'screenshot-content';

export function run(root) {
  let size;
  try {
    size = readFileSync(join(root, 'screenshot.png')).length;
  } catch (error) {
    return {
      ok: false,
      failures: [`screenshot.png — ${error.code === 'ENOENT' ? 'missing' : error.message}`],
      notes: [],
    };
  }

  if (size < MIN_SCREENSHOT_BYTES) {
    return {
      ok: false,
      failures: [
        `screenshot.png is ${size} bytes; must be at least ${MIN_SCREENSHOT_BYTES} bytes to reject the flat placeholder`,
      ],
      notes: [],
    };
  }

  return {
    ok: true,
    failures: [],
    notes: [`screenshot.png is ${size} bytes (minimum ${MIN_SCREENSHOT_BYTES})`],
  };
}
