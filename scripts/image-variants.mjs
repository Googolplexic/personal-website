/**
 * WebP sizes written next to each full-size image, shared by
 * scripts/optimize-images.mjs and the admin API.
 *
 * - web/<name>.webp       listing cards and the default src
 * - web/1280/<name>.webp  carousels and high-density screens
 * - web/2560/<name>.webp  the lightbox
 *
 * A size is skipped when the source isn't wider than the size before it.
 */
export const WEB_VARIANTS = [
  { dir: '', width: 600, quality: 65 },
  { dir: '1280/', width: 1280, quality: 75 },
  { dir: '2560/', width: 2560, quality: 80 },
];

/** "a/b/foo.png" → "a/b/web/<dir>foo.webp" */
export function variantPath(imagePath, variant) {
  const normalized = imagePath.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  const dir = normalized.substring(0, lastSlash);
  const name = normalized.substring(lastSlash + 1).replace(/\.[^.]+$/, '');
  return `${dir}/web/${variant.dir}${name}.webp`;
}

/** Variants worth writing for a source of the given width. */
export function variantsFor(sourceWidth) {
  return WEB_VARIANTS.filter((variant, i) => i === 0 || sourceWidth > WEB_VARIANTS[i - 1].width);
}
