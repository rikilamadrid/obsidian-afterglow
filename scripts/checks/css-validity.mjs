/**
 * CSS validity, via stylelint.
 *
 * Run programmatically rather than as a separate npm script so that it is part
 * of the same suite as everything else — which is what lets the negative
 * harness prove this check can fail too.
 *
 * The config is imported as an object and given configBasedir pointing at the
 * repository, so `extends` resolves from the repository's node_modules even
 * when the files being linted live in a throwaway copy elsewhere.
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';

import config from '../../stylelint.config.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const name = 'css-validity';

export async function run(root) {
  const result = await stylelint.lint({
    files: [join(root, 'src', '*.css'), join(root, 'theme.css')],
    config,
    configBasedir: repoRoot,
  });

  const failures = [];
  let files = 0;

  for (const file of result.results) {
    files++;
    const relative = file.source.startsWith(root) ? file.source.slice(root.length + 1) : file.source;

    if (file.parseErrors?.length) {
      for (const error of file.parseErrors) {
        failures.push(`${relative}:${error.line} — ${error.text}`);
      }
    }
    for (const warning of file.warnings) {
      failures.push(`${relative}:${warning.line}:${warning.column} — ${warning.text}`);
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    notes: failures.length === 0 ? [`${files} stylesheets valid`] : [],
  };
}
