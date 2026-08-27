/**
 * Documentation assets are repository evidence, not release files.
 *
 * Keep this separate from required-files: Obsidian and the community directory
 * read the release contract, while README previews and brand assets support the
 * repository documentation only.
 */

import { readFileSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

const REQUIRED_ASSETS = [
  'assets/afterglow-mark.svg',
  'assets/afterglow-wordmark.svg',
  'assets/sample-note.md',
  'assets/preview-light.png',
  'assets/preview-dark.png',
];

const BRANDING_SVGS = [
  'assets/afterglow-mark.svg',
  'assets/afterglow-wordmark.svg',
];

const PREVIEWS = [
  'assets/preview-light.png',
  'assets/preview-dark.png',
];

const MAX_PREVIEW_BYTES = 500_000;
const SVG_NAMESPACE = 'xmlns="http://www.w3.org/2000/svg"';
const SVG_SAFETY_RULES = [
  {
    pattern: /https?:\/\/|xlink:href/i,
    message: 'disallowed URL or xlink reference',
  },
  {
    pattern: /<script\b|on[a-z]+\s*=|<image\b|<use\b|href\s*=|src\s*=|@import\b|data:|<foreignObject\b|<font\b|<text\b/i,
    message: 'resource-loading, script, embedded content, or text element',
  },
  {
    pattern: /font-family|font-face|@font/i,
    message: 'font dependency',
  },
];

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function markdownDestination(raw) {
  const value = raw.trim();
  if (value.startsWith('<')) {
    const end = value.indexOf('>');
    return end === -1 ? value : value.slice(1, end);
  }
  return value.split(/\s+/, 1)[0];
}

function isLocal(target) {
  return target && !target.startsWith('#') && !target.startsWith('//')
    && !/^[a-z][a-z0-9+.-]*:/i.test(target);
}

function readmeTargets(markdown) {
  const targets = new Set();

  for (const match of markdown.matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
    const target = markdownDestination(match[1]);
    if (isLocal(target)) targets.add(target);
  }

  for (const tag of markdown.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    for (const attribute of tag[0].matchAll(/\b(src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      const name = attribute[1].toLowerCase();
      const value = attribute[2] ?? attribute[3] ?? attribute[4];
      const candidates = name === 'srcset'
        ? value.split(',').map((entry) => entry.trim().split(/\s+/, 1)[0])
        : [value];
      for (const target of candidates) {
        if (isLocal(target)) targets.add(target);
      }
    }
  }

  return [...targets].sort();
}

function pngSize(buffer) {
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('not a PNG');
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function validateSvg(root, asset, failures) {
  const svg = readFileSync(resolve(root, asset), 'utf8');
  const namespaceCount = svg.split(SVG_NAMESPACE).length - 1;
  if (namespaceCount !== 1 || !svg.split('\n', 1)[0].includes(SVG_NAMESPACE)) {
    failures.push(`${asset}:1 — expected exactly one ${SVG_NAMESPACE} declaration on the root element`);
  }

  const scanned = svg.replace(SVG_NAMESPACE, '');
  scanned.split('\n').forEach((line, index) => {
    for (const rule of SVG_SAFETY_RULES) {
      if (rule.pattern.test(line)) {
        failures.push(`${asset}:${index + 1} — ${rule.message}: ${line.trim()}`);
      }
    }
  });
}

export const name = 'docs-assets';

export function run(root) {
  const failures = [];
  const present = new Set();

  for (const asset of REQUIRED_ASSETS) {
    try {
      const stat = statSync(resolve(root, asset));
      if (!stat.isFile()) throw new Error('not a regular file');
      if (stat.size === 0) throw new Error('is empty');
      present.add(asset);
    } catch (error) {
      const detail = error.code === 'ENOENT' ? 'missing' : error.message;
      failures.push(`${asset} — required documentation asset ${detail}`);
    }
  }

  const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
  const targets = readmeTargets(readme);
  for (const target of targets) {
    let decoded;
    try {
      decoded = decodeURIComponent(target.split(/[?#]/, 1)[0]);
    } catch {
      failures.push(`README.md — invalid local path encoding: ${target}`);
      continue;
    }

    const path = resolve(root, decoded);
    const fromRoot = relative(resolve(root), path);
    if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) {
      failures.push(`README.md — local path escapes repository: ${target}`);
      continue;
    }

    try {
      const stat = statSync(path);
      if (!stat.isFile()) throw new Error('not a regular file');
    } catch (error) {
      const detail = error.code === 'ENOENT' ? 'missing' : error.message;
      failures.push(`README.md — local path ${detail}: ${target}`);
    }
  }

  for (const asset of BRANDING_SVGS) {
    if (present.has(asset)) validateSvg(root, asset, failures);
  }

  const previewSizes = [];
  for (const asset of PREVIEWS) {
    if (!present.has(asset)) continue;
    const buffer = readFileSync(resolve(root, asset));
    if (buffer.length >= MAX_PREVIEW_BYTES) {
      failures.push(`${asset} — ${buffer.length} bytes, must be under ${MAX_PREVIEW_BYTES}`);
    }
    try {
      previewSizes.push({ asset, ...pngSize(buffer) });
    } catch (error) {
      failures.push(`${asset} — ${error.message}`);
    }
  }

  if (previewSizes.length === PREVIEWS.length) {
    const [light, dark] = previewSizes;
    if (light.width !== dark.width || light.height !== dark.height) {
      failures.push(
        `${light.asset} is ${light.width}x${light.height}, but ${dark.asset} is ${dark.width}x${dark.height}`,
      );
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    notes: failures.length === 0
      ? [
        `${targets.length} README-local paths resolve`,
        `${REQUIRED_ASSETS.length} documentation assets present`,
        `${BRANDING_SVGS.length} SVG brand assets are self-contained`,
        `${PREVIEWS.length} matching previews are valid PNGs under 500 KB`,
      ]
      : [],
  };
}
