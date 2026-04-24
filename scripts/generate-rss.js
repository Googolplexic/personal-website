/**
 * Generates static RSS 2.0 feeds in dist/ after vite build.
 * Writes rss.xml (combined), rss-portfolio.xml, rss-origami.xml.
 * Dates align with lastmod-cache.json when present (same keys as vite sitemap).
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

function getItemDate(cache, cacheKey, srcDir) {
  const cached = cache[cacheKey];
  if (cached) {
    const d = new Date(cached);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const m = getDirLatestMtime(srcDir);
  return m.getTime() ? m : new Date();
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
    const pubDate = getItemDate(cache, `assets/projects/${slug}`, path.join(SRC_PROJECTS, slug));
    items.push({
      title,
      link: url,
      guid: url,
      pubDate,
      description,
      category: 'Portfolio',
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
    if (fs.existsSync(mdPath)) {
      const fm = parseFrontmatter(mdPath);
      if (fm.title) title = fm.title;
      description = (fm.description || '').trim() || description;
    }
    const url = `${BASE_URL}/origami/${slug}`;
    const pubDate = getItemDate(cache, cacheKey, srcDir);
    items.push({
      title,
      link: url,
      guid: url,
      pubDate,
      description,
      category: 'Origami',
    });
  }
  return items;
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => b.pubDate - a.pubDate);
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
      return `
    <item>
      <title><![CDATA[${escapeCdata(item.title)}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${rfc822(item.pubDate)}</pubDate>
      <category><![CDATA[${escapeCdata(item.category)}]]></category>
      <description><![CDATA[${escapeCdata(item.description)}]]></description>
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${escapeCdata(title)}]]></title>
    <link>${BASE_URL}</link>
    <description><![CDATA[${escapeCdata(description)}]]></description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
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
  const pItems = sortByDateDesc(portfolioItems(cache));
  const oItems = sortByDateDesc(origamiItems(cache));
  const combined = sortByDateDesc([...pItems, ...oItems]);

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
