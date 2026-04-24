/**
 * Sets package.json "version" to the same string as getSiteVersionFromGit().
 * Skips writes when resolution fails ("dev") so local/package.json is not clobbered.
 * Invoked via prebuild so builds stay aligned with git tags; run `pnpm sync-version` anytime.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSiteVersionFromGit } from './site-version-from-git.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '..', 'package.json');

const next = await getSiteVersionFromGit();
if (next === 'dev') {
  console.warn(
    'sync-package-version: could not resolve version from git/GitHub; leaving package.json unchanged'
  );
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
if (pkg.version === next) {
  process.exit(0);
}

pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
console.log(`package.json version → ${next}`);
