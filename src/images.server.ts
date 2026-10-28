import path from 'node:path';
import sharp from 'sharp';
import type { ImageSet } from './types';
import { PLACEHOLDER_WIDTH } from './utils/imagePlaceholder';

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
    await Promise.all([...variantsByBase].map(async ([base, variants]) => {
        const baseUrl = files[base];
        if (!baseUrl) return;
        variants.sort((a, b) => a.width - b.width);
        const largest = variants[variants.length - 1];
        sets.set(baseUrl, {
            width: largest.width,
            height: largest.height,
            srcSet: variants.filter((v) => !v.lightboxOnly).map((v) => `${v.url} ${v.width}w`).join(', '),
            large: largest.url,
            placeholder: await blurredPlaceholder(path.resolve('src', base)),
        });
    }));
    return sets;
}

/** An 8px-wide WebP of the image as a data URL, around 100 bytes; ImagePlaceholder blurs it. */
async function blurredPlaceholder(file: string) {
    const data = await sharp(file)
        .resize(PLACEHOLDER_WIDTH, null, { fit: 'inside' })
        .webp({ quality: 50 })
        .toBuffer();
    return `data:image/webp;base64,${data.toString('base64')}`;
}

const imageSetsByUrl = await readImageSets();

/** Sizes for the given image URLs, keyed by URL; images without web/ copies are left out. */
export function imageSets(urls: (string | undefined)[]): Record<string, ImageSet> {
    return Object.fromEntries(urls.flatMap((url) => {
        const set = url ? imageSetsByUrl.get(url) : undefined;
        return set ? [[url, set]] : [];
    }));
}
