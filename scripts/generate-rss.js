/**
 * Generates static RSS 2.0 feeds in dist/ after vite build.
 * Writes rss.xml (combined), rss-portfolio.xml, rss-origami.xml.
 *
 * Item ordering uses editorial dates from frontmatter (portfolio: endDate or startDate;
 * origami: date), then falls back to lastmod-cache / filesystem mtimes.
 * pubDate in the feed matches that editorial-or-fallback instant (newest first).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CACHE_FILE = path.join(ROOT, 'lastmod-cache.json');
const BASE_URL = 'https://www.colemanlai.com';

const SRC_PROJECTS = path.join(ROOT, 'src', 'assets', 'projects');
const ORIGAMI_BASE = path.join(ROOT, 'src', 'assets', 'origami');

const FEED_AUTHOR_NAME = 'Coleman Lai';

const distImagesDir = () => path.join(DIST, 'assets', 'images');
const distProjectsImagesDir = () => path.join(distImagesDir(), 'projects');
const distOrigamiImagesDir = () => path.join(distImagesDir(), 'origami');

function parseFrontmatter(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf-8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const out = {};
  let currentKey = null;
  for (const rawLine of yaml.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const v = kv[2].trim();
      out[currentKey] = v === '' ? [] : v;
    } else if (currentKey && line.match(/^-\s+/)) {
      if (!Array.isArray(out[currentKey])) out[currentKey] = [];
      out[currentKey].push(line.replace(/^-\s+/, '').trim());
    }
  }
  return out;
}

/** YYYY-MM -> first day of month UTC noon (stable ordering) */
function parseMetadataDate(value) {
  if (value == null || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}-01T12:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getPortfolioEditorialDate(fm) {
  const end = parseMetadataDate(
    typeof fm.endDate === 'string' ? fm.endDate : null
  );
  const start = parseMetadataDate(
    typeof fm.startDate === 'string' ? fm.startDate : null
  );
  return end ?? start ?? null;
}

function getOrigamiEditorialDate(fm) {
  return parseMetadataDate(typeof fm.date === 'string' ? fm.date : null);
}

function getDirLatestMtime(dirPath) {
  if (!fs.existsSync(dirPath)) return new Date(0);
  let latest = fs.statSync(dirPath).mtime;
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return latest;
  }
  for (const e of entries) {
    const p = path.join(dirPath, e.name);
    try {
      if (e.isDirectory()) {
        const d = getDirLatestMtime(p);
        if (d > latest) latest = d;
      } else {
        const t = fs.statSync(p).mtime;
        if (t > latest) latest = t;
      }
    } catch {
      /* ignore */
    }
  }
  return latest;
}

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

/** Fallback when editorial date missing: cache lastmod, else folder mtime, else epoch (not build time). */
function getFallbackDate(cache, cacheKey, srcDir) {
  const cached = cache[cacheKey];
  if (cached) {
    const d = new Date(cached);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const m = getDirLatestMtime(srcDir);
  return m.getTime() ? m : new Date(0);
}

function resolvePubDate(editorial, fallback) {
  return editorial ?? fallback;
}

function getFirstImageBasenameProject(slug) {
  const projectPath = path.join(SRC_PROJECTS, slug);
  for (const subdir of ['images/web', 'images']) {
    const dirPath = path.join(projectPath, subdir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort();
    if (files.length > 0) return path.basename(files[0], path.extname(files[0]));
  }
  return null;
}

function findBuiltImageUrl(basename, flatDir) {
  if (!fs.existsSync(flatDir) || !basename) return null;
  const files = fs.readdirSync(flatDir).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  const prefix = basename + '-';
  const found = files.find((f) => f.startsWith(prefix));
  if (!found) return null;
  const relativePath = path.relative(DIST, path.join(flatDir, found)).replace(/\\/g, '/');
  return BASE_URL + '/' + relativePath;
}

function getFirstOrigamiImageBasename(slug) {
  for (const group of ['my-designs', 'other-designs']) {
    const dir = path.join(ROOT, 'src', 'assets', 'origami', group, slug);
    if (!fs.existsSync(dir)) continue;
    for (const subdir of ['web', '.']) {
      const dirPath = subdir === '.' ? dir : path.join(dir, subdir);
      if (!fs.existsSync(dirPath)) continue;
      const files = fs
        .readdirSync(dirPath)
        .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.toLowerCase().includes('pattern'))
        .sort();
      if (files.length > 0) return path.basename(files[0], path.extname(files[0]));
    }
  }
  return null;
}

function findOrigamiImageInDist(stem, flatImagesDirPath) {
  if (!fs.existsSync(flatImagesDirPath) || !stem) return null;
  const files = fs
    .readdirSync(flatImagesDirPath)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.includes('pattern') && f.startsWith(stem));
  if (files.length === 0) return null;
  const chosen = files.sort()[0];
  const relativePath = path.relative(DIST, path.join(flatImagesDirPath, chosen)).replace(/\\/g, '/');
  return BASE_URL + '/' + relativePath;
}

function pickBestOgImage(files) {
  if (files.length === 0) return null;
  const sorted = [...files].sort();
  const getNumPrefix = (f) => {
    const m = f.match(/^(\d+)/);
    return m ? m[1] : '';
  };
  const firstNum = getNumPrefix(sorted[0]);
  const firstGroup = sorted.filter((f) => getNumPrefix(f) === firstNum);
  const nonWebp = firstGroup.find((f) => /\.(png|jpg|jpeg)$/i.test(f));
  return nonWebp || firstGroup[0];
}

function resolvePortfolioImageUrl(slug) {
  const projectsDir = distProjectsImagesDir();
  const projectImageDir = path.join(projectsDir, slug);
  let image = null;
  if (fs.existsSync(projectImageDir)) {
    const files = fs.readdirSync(projectImageDir).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
    const bestFile = pickBestOgImage(files);
    if (bestFile) {
      const relativePath = path.relative(DIST, path.join(projectImageDir, bestFile)).replace(/\\/g, '/');
      image = BASE_URL + '/' + relativePath;
    }
  }
  if (!image) {
    const basename = getFirstImageBasenameProject(slug);
    image = findBuiltImageUrl(basename, distImagesDir());
  }
  return image;
}

function resolveOrigamiImageUrl(slug) {
  const flat = distImagesDir();
  const slugImageDir = path.join(distOrigamiImagesDir(), slug);
  let image = null;
  if (fs.existsSync(slugImageDir)) {
    const files = fs
      .readdirSync(slugImageDir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.includes('pattern'));
    const bestFile = pickBestOgImage(files);
    if (bestFile) {
      const relativePath = path.relative(DIST, path.join(slugImageDir, bestFile)).replace(/\\/g, '/');
      image = BASE_URL + '/' + relativePath;
    }
  }
  if (!image) {
    const stem = getFirstOrigamiImageBasename(slug);
    if (stem) image = findOrigamiImageInDist(stem, flat);
  }
  return image;
}

function portfolioCategories(fm) {
  const cats = new Set(['Portfolio']);
  for (const t of Array.isArray(fm.tags) ? fm.tags : []) {
    if (t && String(t).trim()) cats.add(String(t).trim());
  }
  for (const t of Array.isArray(fm.technologies) ? fm.technologies : []) {
    if (t && String(t).trim()) cats.add(String(t).trim());
  }
  return [...cats];
}

function origamiCategories(fm) {
  const cats = new Set(['Origami']);
  if (fm.designer && typeof fm.designer === 'string' && fm.designer.trim()) {
    cats.add(`Designer: ${fm.designer.trim()}`);
  }
  return [...cats];
}

function escapeXmlAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function distPathFromPublicUrl(url) {
  if (!url || !url.startsWith(BASE_URL)) return null;
  const rel = url.slice(BASE_URL.length).replace(/^\//, '');
  return path.join(DIST, rel);
}

function enclosureFromUrl(url) {
  if (!url) return '';
  const p = distPathFromPublicUrl(url);
  if (!p || !fs.existsSync(p)) return '';
  let size;
  try {
    size = fs.statSync(p).size;
  } catch {
    return '';
  }
  const ext = path.extname(p).toLowerCase();
  const type =
    ext === '.png'
      ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
          ? 'image/webp'
          : 'application/octet-stream';
  const u = escapeXmlAttr(url);
  return `\n      <enclosure url="${u}" length="${size}" type="${type}"/>`;
}

function mediaContentFromUrl(url) {
  if (!url) return '';
  const p = distPathFromPublicUrl(url);
  if (!p || !fs.existsSync(p)) return '';
  const ext = path.extname(p).toLowerCase();
  const type =
    ext === '.png'
      ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
          ? 'image/webp'
          : 'application/octet-stream';
  const u = escapeXmlAttr(url);
  return `\n      <media:content url="${u}" type="${type}" medium="image"/>`;
}

function rfc822(d) {
  return d.toUTCString();
}

function escapeCdata(s) {
  return String(s).replace(/]]>/g, ']]]]><![CDATA[>');
}

function scanProjects() {
  if (!fs.existsSync(SRC_PROJECTS)) return [];
  return fs
    .readdirSync(SRC_PROJECTS, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() &&
        e.name !== 'template' &&
        fs.existsSync(path.join(SRC_PROJECTS, e.name, 'index.ts'))
    )
    .map((e) => e.name)
    .sort();
}

function scanOrigami() {
  const out = [];
  for (const group of ['my-designs', 'other-designs']) {
    const groupPath = path.join(ORIGAMI_BASE, group);
    if (!fs.existsSync(groupPath)) continue;
    fs.readdirSync(groupPath, { withFileTypes: true })
      .filter(
        (e) =>
          e.isDirectory() &&
          e.name !== 'template' &&
          fs.existsSync(path.join(groupPath, e.name, 'index.ts'))
      )
      .forEach((e) => {
        out.push({
          slug: e.name,
          cacheKey: `assets/origami/${group}/${e.name}`,
          srcDir: path.join(groupPath, e.name),
        });
      });
  }
  return out;
}

function portfolioItems(cache) {
  const items = [];
  for (const slug of scanProjects()) {
    const mdPath = path.join(SRC_PROJECTS, slug, 'description.md');
    if (!fs.existsSync(mdPath)) continue;
    const fm = parseFrontmatter(mdPath);
    const rawTitle = fm.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const title = typeof rawTitle === 'string' ? rawTitle : slug;
    const rawDesc = (fm.SEOdescription || fm.summary || '').trim();
    const description = rawDesc || `${title} — portfolio project.`;
    const url = `${BASE_URL}/portfolio/${slug}`;
    const editorial = getPortfolioEditorialDate(fm);
    const fallback = getFallbackDate(cache, `assets/projects/${slug}`, path.join(SRC_PROJECTS, slug));
    const pubDate = resolvePubDate(editorial, fallback);
    const categories = portfolioCategories(fm);
    const imageUrl = resolvePortfolioImageUrl(slug);
    items.push({
      slug,
      title,
      link: url,
      guid: url,
      pubDate,
      description,
      categories,
      imageUrl,
    });
  }
  return items;
}

function origamiItems(cache) {
  const items = [];
  for (const { slug, cacheKey, srcDir } of scanOrigami()) {
    const infoMy = path.join(ORIGAMI_BASE, 'my-designs', slug, 'info.md');
    const infoOther = path.join(ORIGAMI_BASE, 'other-designs', slug, 'info.md');
    const mdPath = fs.existsSync(infoMy) ? infoMy : infoOther;
    let title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    let description = `${title} — origami by Coleman Lai.`;
    let fm = {};
    if (fs.existsSync(mdPath)) {
      fm = parseFrontmatter(mdPath);
      if (fm.title) title = fm.title;
      description = (fm.description || '').trim() || description;
    }
    const url = `${BASE_URL}/origami/${slug}`;
    const editorial = getOrigamiEditorialDate(fm);
    const fallback = getFallbackDate(cache, cacheKey, srcDir);
    const pubDate = resolvePubDate(editorial, fallback);
    const categories = origamiCategories(fm);
    const imageUrl = resolveOrigamiImageUrl(slug);
    items.push({
      slug,
      title,
      link: url,
      guid: url,
      pubDate,
      description,
      categories,
      imageUrl,
    });
  }
  return items;
}

function sortFeedItems(items) {
  return [...items].sort((a, b) => {
    const dt = b.pubDate.getTime() - a.pubDate.getTime();
    if (dt !== 0) return dt;
    return String(a.slug).localeCompare(String(b.slug));
  });
}

function buildRssXml({ title, description, feedUrl, items }) {
  const lastBuildDate = rfc822(
    items.length ? new Date(Math.max(...items.map((i) => i.pubDate.getTime()))) : new Date()
  );
  const channelItems = items
    .map((item) => {
      if (!item.title || !item.link || !item.guid) {
        throw new Error(`RSS item missing required fields: ${JSON.stringify(item)}`);
      }
      const categoryBlocks = (item.categories || []).map(
        (c) => `\n      <category><![CDATA[${escapeCdata(c)}]]></category>`
      );
      const enc = enclosureFromUrl(item.imageUrl);
      const media = mediaContentFromUrl(item.imageUrl);
      return `
    <item>
      <title><![CDATA[${escapeCdata(item.title)}]]></title>
      <link>${escapeXmlAttr(item.link)}</link>
      <guid isPermaLink="true">${escapeXmlAttr(item.guid)}</guid>
      <pubDate>${rfc822(item.pubDate)}</pubDate>
      <author>${escapeXmlAttr(FEED_AUTHOR_NAME)}</author>
      <dc:creator>${escapeXmlAttr(FEED_AUTHOR_NAME)}</dc:creator>${categoryBlocks.join('')}${enc}${media}
      <description><![CDATA[${escapeCdata(item.description)}]]></description>
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title><![CDATA[${escapeCdata(title)}]]></title>
    <link>${BASE_URL}</link>
    <description><![CDATA[${escapeCdata(description)}]]></description>
    <language>en-us</language>
    <managingEditor>${escapeXmlAttr(FEED_AUTHOR_NAME)}</managingEditor>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXmlAttr(feedUrl)}" rel="self" type="application/rss+xml"/>
    ${channelItems}
  </channel>
</rss>
`;
}

function validateXml(xml) {
  if (!xml.includes('<?xml') || !xml.includes('<rss')) {
    throw new Error('Generated RSS XML appears malformed');
  }
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('generate-rss: dist/ not found; run vite build first.');
    process.exit(1);
  }

  const cache = loadCache();
  const pItems = sortFeedItems(portfolioItems(cache));
  const oItems = sortFeedItems(origamiItems(cache));
  const combined = sortFeedItems([...pItems, ...oItems]);

  const feeds = [
    {
      file: 'rss.xml',
      title: 'Coleman Lai — Portfolio & Origami',
      description:
        'Updates from colemanlai.com: software portfolio projects and origami designs.',
      feedUrl: `${BASE_URL}/rss.xml`,
      items: combined,
    },
    {
      file: 'rss-portfolio.xml',
      title: 'Coleman Lai — Portfolio',
      description: 'Software and development projects by Coleman Lai.',
      feedUrl: `${BASE_URL}/rss-portfolio.xml`,
      items: pItems,
    },
    {
      file: 'rss-origami.xml',
      title: 'Coleman Lai — Origami',
      description: 'Origami designs and gallery updates by Coleman Lai.',
      feedUrl: `${BASE_URL}/rss-origami.xml`,
      items: oItems,
    },
  ];

  for (const f of feeds) {
    const xml = buildRssXml(f);
    validateXml(xml);
    const outPath = path.join(DIST, f.file);
    fs.writeFileSync(outPath, xml, 'utf-8');
    console.log('Generated', outPath, `(${f.items.length} items)`);
  }
}

main();
