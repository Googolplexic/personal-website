/**
 * Generates api/og-meta.json for crawler OG injection.
 * Run after `vite build` so dist/assets/images/projects/<slug>/ has built image paths.
 * Reads project frontmatter from src/assets/projects/<slug>/description.md.
 * Uses original image URLs (no cropping); og:image dimensions are omitted so previews show images in their natural aspect ratio.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://www.colemanlai.com';
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SRC_PROJECTS = path.join(ROOT, 'src', 'assets', 'projects');
const API_DIR = path.join(ROOT, 'api');
const ROLE_SEO = 'Currently a Gen AI Software Developer (Co-op) at IFS Copperleaf (Sept 2025-Apr 2026).';

const DEFAULT_META = {
  '/': {
    title: 'Coleman Lai | Developer & Origami Artist | Vancouver',
    description: 'Explore software projects and origami portfolio by Coleman Lai, Gen AI Developer at IFS Copperleaf. Computing Science student at SFU, Vancouver, BC.',
    image: null,
  },
  '/portfolio': {
    title: 'Software Portfolio | Coleman Lai',
    description: 'Browse software development projects by Coleman Lai, including web applications, AI implementations, and technical solutions. ' + ROLE_SEO,
    image: null,
  },
  '/origami': {
    title: 'Origami Gallery | Coleman Lai',
    description: 'Discover intricate origami creations by Coleman Lai. View complex paper art designs, original patterns, and folding software.',
    image: null,
  },
};

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

/** Get first image basename (no ext) from project src, e.g. "01-demo" from "01-demo.webp" */
function getFirstImageBasename(slug) {
  const projectPath = path.join(SRC_PROJECTS, slug);
  for (const subdir of ['images/web', 'images']) {
    const dirPath = path.join(projectPath, subdir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort();
    if (files.length > 0) return path.basename(files[0], path.extname(files[0]));
  }
  return null;
}

/** Find built image URL in dist/assets/images/ by matching basename (Vite outputs [name]-[hash][ext]) */
function findBuiltImageUrl(basename, distImagesDir) {
  if (!fs.existsSync(distImagesDir) || !basename) return null;
  const files = fs.readdirSync(distImagesDir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  const prefix = basename + '-';
  const found = files.find((f) => f.startsWith(prefix));
  if (!found) return null;
  const relativePath = path.relative(DIST, path.join(distImagesDir, found)).replace(/\\/g, '/');
  return BASE_URL + '/' + relativePath;
}

/** Get first model image basename (no ext) for an origami slug from source (e.g. "01-tonberry") */
function getFirstOrigamiImageBasename(slug) {
  for (const group of ['my-designs', 'other-designs']) {
    const dir = path.join(ROOT, 'src', 'assets', 'origami', group, slug);
    if (!fs.existsSync(dir)) continue;
    for (const subdir of ['web', '.']) {
      const dirPath = subdir === '.' ? dir : path.join(dir, subdir);
      if (!fs.existsSync(dirPath)) continue;
      const files = fs.readdirSync(dirPath)
        .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.toLowerCase().includes('pattern'))
        .sort();
      if (files.length > 0) return path.basename(files[0], path.extname(files[0]));
    }
  }
  return null;
}

/** Find origami image in flat dist/assets/images/ (built names like "01-tonberry.png-[hash].jpg") */
function findOrigamiImageInDist(stem, distImagesDir) {
  if (!fs.existsSync(distImagesDir) || !stem) return null;
  const files = fs.readdirSync(distImagesDir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.includes('pattern') && f.startsWith(stem));
  if (files.length === 0) return null;
  const chosen = files.sort()[0];
  const relativePath = path.relative(DIST, path.join(distImagesDir, chosen)).replace(/\\/g, '/');
  return BASE_URL + '/' + relativePath;
}

/**
 * Pick the best OG image from a list of built filenames.
 * Groups by leading numeric prefix (e.g. "01-"), picks the first group,
 * then prefers non-WebP formats (PNG/JPG/JPEG) because:
 *  - Originals are always well above Vite's assetsInlineLimit → guaranteed
 *    standalone files in dist (WebP thumbnails can be inlined & disappear).
 *  - Universal crawler support (some older crawlers don't handle WebP).
 *  - Higher quality than the 600px / q65 web/ thumbnails.
 */
function pickBestOgImage(files) {
  if (files.length === 0) return null;

  const sorted = [...files].sort();

  // Extract leading numeric prefix (e.g. "01" from "01-doug-hash.png")
  const getNumPrefix = (f) => {
    const m = f.match(/^(\d+)/);
    return m ? m[1] : '';
  };

  const firstNum = getNumPrefix(sorted[0]);
  const firstGroup = sorted.filter((f) => getNumPrefix(f) === firstNum);

  // Prefer original formats over WebP
  const nonWebp = firstGroup.find((f) => /\.(png|jpg|jpeg)$/i.test(f));
  return nonWebp || firstGroup[0];
}

function main() {
  const meta = { ...DEFAULT_META };
  const distImagesDir = path.join(DIST, 'assets', 'images');
  const distProjectsDir = path.join(distImagesDir, 'projects');

  if (!fs.existsSync(SRC_PROJECTS)) {
    if (!fs.existsSync(API_DIR)) fs.mkdirSync(API_DIR, { recursive: true });
    fs.writeFileSync(path.join(API_DIR, 'og-meta.json'), JSON.stringify(meta, null, 2), 'utf-8');
    console.log('Generated api/og-meta.json (no projects)');
    return;
  }

  const slugs = fs.readdirSync(SRC_PROJECTS).filter((name) => {
    const p = path.join(SRC_PROJECTS, name);
    return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'description.md'));
  });

  for (const slug of slugs) {
    const mdPath = path.join(SRC_PROJECTS, slug, 'description.md');
    const fm = parseFrontmatter(mdPath);
    const rawTitle = fm.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const title = typeof rawTitle === 'string' ? rawTitle : slug;
    const rawDesc = (fm.SEOdescription || fm.summary || '').trim();
    const description = rawDesc || `${title} — portfolio project.`;

    let image = null;
    const projectImageDir = path.join(distProjectsDir, slug);
    if (fs.existsSync(projectImageDir)) {
      const files = fs.readdirSync(projectImageDir)
        .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
      const bestFile = pickBestOgImage(files);
      if (bestFile) {
        const relativePath = path.relative(DIST, path.join(projectImageDir, bestFile)).replace(/\\/g, '/');
        image = BASE_URL + '/' + relativePath;
      }
    }
    if (!image) {
      const basename = getFirstImageBasename(slug);
      image = findBuiltImageUrl(basename, distImagesDir);
    }

    meta['/portfolio/' + slug] = {
      title: title + ' | Coleman Lai',
      description,
      image: image || meta['/'].image,
    };
  }

  // Origami detail pages: read from src/assets/origami (my-designs + other-designs)
  const origamiSlugs = new Set();
  for (const group of ['my-designs', 'other-designs']) {
    const groupPath = path.join(ROOT, 'src', 'assets', 'origami', group);
    if (!fs.existsSync(groupPath)) continue;
    const dirs = fs.readdirSync(groupPath).filter((name) => {
      const p = path.join(groupPath, name);
      return fs.statSync(p).isDirectory() && name !== 'template';
    });
    dirs.forEach((d) => origamiSlugs.add(d));
  }

  const flatImagesDir = path.join(DIST, 'assets', 'images');
  const origamiBaseImagesDir = path.join(flatImagesDir, 'origami');

  for (const slug of origamiSlugs) {
    const infoPath = path.join(ROOT, 'src', 'assets', 'origami', 'my-designs', slug, 'info.md');
    const otherPath = path.join(ROOT, 'src', 'assets', 'origami', 'other-designs', slug, 'info.md');
    const mdPath = fs.existsSync(infoPath) ? infoPath : otherPath;
    let title = slug;
    let description = '';
    if (fs.existsSync(mdPath)) {
      const fm = parseFrontmatter(mdPath);
      title = fm.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      description = (fm.description || '').trim() || `${title} — origami by Coleman Lai.`;
    } else {
      description = `${title} — origami.`;
    }

    let image = null;
    const slugImageDir = path.join(origamiBaseImagesDir, slug);
    if (fs.existsSync(slugImageDir)) {
      const files = fs.readdirSync(slugImageDir)
        .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.includes('pattern'));
      const bestFile = pickBestOgImage(files);
      if (bestFile) {
        const relativePath = path.relative(DIST, path.join(slugImageDir, bestFile)).replace(/\\/g, '/');
        image = BASE_URL + '/' + relativePath;
      }
    }
    if (!image) {
      const stem = getFirstOrigamiImageBasename(slug);
      if (stem) image = findOrigamiImageInDist(stem, flatImagesDir);
    }

    meta['/origami/' + slug] = {
      title: title + ' | Coleman Lai',
      description,
      image,
    };
  }

  if (!fs.existsSync(API_DIR)) fs.mkdirSync(API_DIR, { recursive: true });
  const outPath = path.join(API_DIR, 'og-meta.json');
  fs.writeFileSync(outPath, JSON.stringify(meta, null, 2), 'utf-8');
  console.log('Generated', outPath, 'with', Object.keys(meta).length, 'routes');
}

main();
