/**
 * Every file Obsidian or the community directory reads must exist, and the
 * screenshot must be the size the directory requires.
 */

import { statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED = [
  'manifest.json',
  'theme.css',
  'README.md',
  'LICENSE',
  'screenshot.png',
];

const SCREENSHOT = { width: 512, height: 288 };

/** Read width and height out of a PNG IHDR chunk. */
function pngSize(path) {
  const buf = readFileSync(path);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(signature)) {
    throw new Error('not a PNG');
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export const name = 'required-files';

export function run(root) {
  const failures = [];
  const notes = [];

  for (const file of REQUIRED) {
    try {
      const stat = statSync(join(root, file));
      if (!stat.isFile()) throw new Error('not a regular file');
      if (stat.size === 0) throw new Error('is empty');
    } catch (error) {
      failures.push(`${file} — ${error.message.replace(/^ENOENT.*/, 'missing')}`);
    }
  }

  if (!failures.some((f) => f.startsWith('screenshot.png'))) {
    try {
      const { width, height } = pngSize(join(root, 'screenshot.png'));
      if (width !== SCREENSHOT.width || height !== SCREENSHOT.height) {
        failures.push(
          `screenshot.png is ${width}x${height}, must be ${SCREENSHOT.width}x${SCREENSHOT.height}`,
        );
      } else {
        notes.push(`screenshot.png is ${width}x${height}`);
      }
    } catch (error) {
      failures.push(`screenshot.png — ${error.message}`);
    }
  }

  if (failures.length === 0) notes.unshift(`${REQUIRED.length} required files present`);
  return { ok: failures.length === 0, failures, notes };
}
