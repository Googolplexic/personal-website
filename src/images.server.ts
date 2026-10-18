import path from 'node:path';
import sharp from 'sharp';
import type { ImageSet } from './types';

// Every size written by scripts/optimize-images.mjs: web/<name>.webp, web/1280/<name>.webp, web/2560/<name>.webp
const files = import.meta.glob<string>('./assets/**/web/**/*.webp', { eager: true, import: 'default' });

interface Variant {
    url: string;
    width: number;
    height: number;
    lightboxOnly: boolean;
}

async function readImageSets() {
    const variantsByBase = new Map<string, Variant[]>();
    await Promise.all(Object.entries(files).map(async ([file, url]) => {
        const { width, height } = await sharp(path.resolve('src', file)).metadata();
        if (!width || !height) return;
        const base = file.replace(/\/web\/\d+\//, '/web/');
        const variants = variantsByBase.get(base) ?? [];
        variants.push({ url, width, height, lightboxOnly: file.includes('/web/2560/') });
        variantsByBase.set(base, variants);
    }));

    const sets = new Map<string, ImageSet>();
    for (const [base, variants] of variantsByBase) {
        const baseUrl = files[base];
        if (!baseUrl) continue;
        variants.sort((a, b) => a.width - b.width);
        const largest = variants[variants.length - 1];
        sets.set(baseUrl, {
            width: largest.width,
            height: largest.height,
            srcSet: variants.filter((v) => !v.lightboxOnly).map((v) => `${v.url} ${v.width}w`).join(', '),
            large: largest.url,
        });
    }
    return sets;
}

const imageSetsByUrl = await readImageSets();

/** Sizes for the given image URLs, keyed by URL; images without web/ copies are left out. */
export function imageSets(urls: (string | undefined)[]): Record<string, ImageSet> {
    return Object.fromEntries(urls.flatMap((url) => {
        const set = url ? imageSetsByUrl.get(url) : undefined;
        return set ? [[url, set]] : [];
    }));
}
