/**
 * Returns HTML with correct og:title, og:description, og:image for the requested path.
 * Used when middleware rewrites crawler requests (Discord, Twitter, etc.) so they
 * get per-page meta instead of the default index.html meta.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://www.colemanlai.com';
const SITE_NAME = 'Coleman Lai';

let metaMap = null;

function loadMeta() {
  if (metaMap) return metaMap;
  try {
    const p = join(__dirname, 'og-meta.json');
    metaMap = JSON.parse(readFileSync(p, 'utf-8'));
  } catch (e) {
    metaMap = {};
  }
  return metaMap;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(meta) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = meta.image ? escapeHtml(meta.image) : '';
  const url = BASE_URL + (meta.path || '/');

  // Only declare dimensions for the default 1200x630 OG image; custom images keep natural aspect ratio
  const imageIsOgDimensions = image && image.endsWith('/og-image.png');
  const ogImageTags = image
    ? `
  <meta property="og:image" content="${image}" />${imageIsOgDimensions ? `
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />` : ''}
  <meta property="og:image:alt" content="${title}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="en_US" />${ogImageTags}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <link rel="canonical" href="${url}" />
</head>
<body><p>Redirecting...</p><script>window.location.replace(${JSON.stringify(url)});</script></body>
</html>`;
}

export default async function handler(req, res) {
  const pathname = (req.query.path || req.url?.split('?')[0] || '/').replace(/#.*$/, '') || '/';
  const map = loadMeta();
  const meta = map[pathname] || map['/'];

  const title = meta?.title || 'Coleman Lai | Developer & Origami Artist | Vancouver';
  const description = meta?.description || 'Explore software projects and origami portfolio by Coleman Lai, Gen AI Developer at IFS Copperleaf. Computing Science student at SFU, Vancouver, BC.';
  const image = meta?.image || null;

  const html = buildHtml({
    title,
    description,
    image,
    path: pathname,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(html);
}
