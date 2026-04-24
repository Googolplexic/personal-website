/**
 * Single source of truth for the site version string (footer __SITE_VERSION__,
 * package.json when synced). Matches git tags `vMAJOR.MINOR` plus commits-ahead,
 * with GitHub API fallback for shallow clones (e.g. Vercel).
 */

import { execSync } from 'node:child_process';

const REPO = 'Googolplexic/personal-website';

export async function getSiteVersionFromGit() {
  try {
    const describe = execSync('git describe --tags --match "v*" --long', {
      encoding: 'utf-8',
    }).trim();
    const match = describe.match(/^v(\d+\.\d+)-(\d+)-g[0-9a-f]+$/);
    if (match) {
      return `${match[1]}.${match[2]}`;
    }
  } catch {
    /* describe unavailable — try GitHub API */
  }

  try {
    const commitSha =
      process.env.VERCEL_GIT_COMMIT_SHA ||
      execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const tagsResp = await fetch(
      `https://api.github.com/repos/${REPO}/tags?per_page=50`
    );
    const tags = await tagsResp.json();
    if (!Array.isArray(tags)) return 'dev';
    const vTags = tags
      .filter((t) => /^v\d+\.\d+$/.test(t.name))
      .sort((a, b) => {
        const ma = a.name.match(/v(\d+)\.(\d+)/);
        const mb = b.name.match(/v(\d+)\.(\d+)/);
        if (!ma || !mb) return 0;
        return +mb[1] * 1000 + +mb[2] - (+ma[1] * 1000 + +ma[2]);
      });
    if (vTags.length === 0) return 'dev';
    const latestTag = vTags[0];
    const compareResp = await fetch(
      `https://api.github.com/repos/${REPO}/compare/${latestTag.name}...${commitSha}`
    );
    const compare = await compareResp.json();
    const ahead = compare.ahead_by ?? 0;
    return `${latestTag.name.slice(1)}.${ahead}`;
  } catch {
    return 'dev';
  }
}
