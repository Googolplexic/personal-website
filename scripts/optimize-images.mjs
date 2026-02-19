#!/usr/bin/env node
/**
 * Image optimization script.
 *
 * For every .jpg/.jpeg/.png in src/assets/origami/ and src/assets/projects/,
 * generates a web-ready WebP thumbnail in a sibling `web/` directory.
 *
 * - Max width: 1200px  (covers 2× retina at 600px display width)
 * - Format:    WebP, quality 80
 * - Idempotent: skips images whose optimized version already exists
 *              and is newer than the source.
 *
 * Usage:
 *   node scripts/optimize-images.mjs            # optimize all
 *   node scripts/optimize-images.mjs --force     # re-optimize everything
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, unlink } from 'node:fs/promises';
import { resolve, join, basename, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const DIRS = [
  join(ROOT, 'src', 'assets', 'origami'),
  join(ROOT, 'src', 'assets', 'projects'),
];

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_WIDTH = 600;
const WEBP_QUALITY = 65;
const FORCE = process.argv.includes('--force');

let optimized = 0;
let skipped = 0;
let removedOrphans = 0;
let errors = 0;

async function walk(dir) {
  const results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'web') continue; // skip output dirs
      results.push(...await walk(full));
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

async function optimizeImage(srcPath) {
  const dir = resolve(srcPath, '..');
  const webDir = join(dir, 'web');
  const name = basename(srcPath, extname(srcPath));
  const outPath = join(webDir, `${name}.webp`);

  // Skip if output exists and is newer than source (unless --force)
  if (!FORCE && existsSync(outPath)) {
    const [srcStat, outStat] = await Promise.all([stat(srcPath), stat(outPath)]);
    if (outStat.mtimeMs >= srcStat.mtimeMs) {
      skipped++;
      return;
    }
  }

  await mkdir(webDir, { recursive: true });

  try {
    await sharp(srcPath)
      .resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outPath);
    optimized++;

    const srcSize = (await stat(srcPath)).size;
    const outSize = (await stat(outPath)).size;
    const pct = ((1 - outSize / srcSize) * 100).toFixed(0);
    console.log(
      `  ✓ ${basename(srcPath)} → web/${name}.webp  (${fmt(srcSize)} → ${fmt(outSize)}, -${pct}%)`
    );
  } catch (err) {
    errors++;
    console.error(`  ✗ ${basename(srcPath)}: ${err.message}`);
  }
}

function fmt(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${(bytes / 1024).toFixed(0)}KB`;
}

// Remove orphaned web/*.webp files when the corresponding full-size image no longer exists.
// Traverses directories under `root` and deletes any web/<name>.webp where no file
// with the same base name and one of IMAGE_EXTS exists in the parent folder.
async function removeOrphanedWebs(root) {
  let removed = 0;

  async function walker(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'web') {
          // inspect files inside this web/ directory
          let webFiles;
          try {
            webFiles = await readdir(full);
          } catch {
            continue;
          }

          for (const wf of webFiles) {
            if (extname(wf).toLowerCase() !== '.webp') continue;
            const base = basename(wf, '.webp');
            const parentDir = dir; // parent of web/
            let existsFull = false;
            for (const ext of IMAGE_EXTS) {
              const candidate = join(parentDir, `${base}${ext}`);
              if (existsSync(candidate)) {
                existsFull = true;
                break;
              }
            }

            if (!existsFull) {
              const target = join(full, wf);
              try {
                await unlink(target);
                removed++;
                console.log(`  - removed orphan ${target.replace(ROOT, '.')}`);
              } catch (err) {
                console.error(`  ✗ failed to remove orphan ${target}: ${err.message}`);
              }
            }
          }
        } else {
          await walker(full);
        }
      }
    }
  }

  await walker(root);
  return removed;
}

async function main() {
  console.log('🖼  Optimizing images...\n');

  for (const dir of DIRS) {
    if (!existsSync(dir)) continue;
    console.log(`Scanning ${dir.replace(ROOT, '.')}...`);
    const images = await walk(dir);
    console.log(`  Found ${images.length} images\n`);

    for (const img of images) {
      await optimizeImage(img);
    }

    // Remove orphaned web/ images in this subtree (if any)
    try {
      const removed = await removeOrphanedWebs(dir);
      if (removed > 0) {
        removedOrphans += removed;
        console.log(`  Removed ${removed} orphaned web image(s) from ${dir.replace(ROOT, '.')}\n`);
      }
    } catch (err) {
      console.error('Failed to clean orphaned web images:', err.message);
    }

    console.log();
  }

  console.log(`Done! ${optimized} optimized, ${skipped} skipped, ${removedOrphans} removed, ${errors} errors`);
  if (errors > 0) process.exit(1);
}

main();
