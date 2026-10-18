#!/usr/bin/env node
/**
 * Image optimization script.
 *
 * For every .jpg/.jpeg/.png in src/assets/origami/ and src/assets/projects/,
 * generates web-ready WebP copies in a sibling `web/` directory, at the
 * sizes listed in scripts/image-variants.mjs.
 *
 * - Idempotent: skips sizes whose optimized version already exists
 *              and is newer than the source.
 *
 * Usage:
 *   node scripts/optimize-images.mjs            # optimize all
 *   node scripts/optimize-images.mjs --force     # re-optimize everything
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, unlink } from 'node:fs/promises';
import { resolve, join, basename, dirname, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WEB_VARIANTS, variantPath, variantsFor } from './image-variants.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const DIRS = [
  join(ROOT, 'src', 'assets', 'origami'),
  join(ROOT, 'src', 'assets', 'projects'),
];

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const FORCE = process.argv.includes('--force');

let optimized = 0;
let skipped = 0;
let removedOrphans = 0;
let errors = 0;
let warnings = 0;

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

async function isFresh(outPath, srcStat) {
  if (FORCE || !existsSync(outPath)) return false;
  return (await stat(outPath)).mtimeMs >= srcStat.mtimeMs;
}

async function optimizeImage(srcPath) {
  const name = basename(srcPath, extname(srcPath));

  const srcStat = await stat(srcPath);
  if (srcStat.size === 0) {
    warnings++;
    console.warn(`  ⚠ ${basename(srcPath)}: file is empty, skipping optimization`);
    return;
  }

  const stale = [];
  for (const variant of WEB_VARIANTS) {
    if (!(await isFresh(variantPath(srcPath, variant), srcStat))) stale.push(variant);
  }

  try {
    const { width } = stale.length > 0 ? await sharp(srcPath).metadata() : {};
    const wanted = stale.filter((variant) => variantsFor(width ?? 0).includes(variant));
    if (wanted.length === 0) {
      skipped++;
      return;
    }

    for (const variant of wanted) {
      const outPath = variantPath(srcPath, variant);
      await mkdir(dirname(outPath), { recursive: true });
      await sharp(srcPath)
        .resize(variant.width, null, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: variant.quality })
        .toFile(outPath);
      optimized++;

      const outSize = (await stat(outPath)).size;
      const pct = ((1 - outSize / srcStat.size) * 100).toFixed(0);
      console.log(
        `  ✓ ${basename(srcPath)} → web/${variant.dir}${name}.webp  (${fmt(srcStat.size)} → ${fmt(outSize)}, -${pct}%)`
      );
    }
  } catch (err) {
    if (/unsupported image format/i.test(err.message)) {
      warnings++;
      console.warn(`  ⚠ ${basename(srcPath)}: ${err.message} (skipped)`);
      return;
    }

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
          // inspect files inside this web/ directory and its size folders
          for (const variant of WEB_VARIANTS) {
            const variantDir = join(full, variant.dir);
            let webFiles;
            try {
              webFiles = await readdir(variantDir);
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
                const target = join(variantDir, wf);
                try {
                  await unlink(target);
                  removed++;
                  console.log(`  - removed orphan ${target.replace(ROOT, '.')}`);
                } catch (err) {
                  console.error(`  ✗ failed to remove orphan ${target}: ${err.message}`);
                }
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

  console.log(`Done! ${optimized} optimized, ${skipped} skipped, ${removedOrphans} removed, ${warnings} warnings, ${errors} errors`);
  if (errors > 0) process.exit(1);
}

main();
