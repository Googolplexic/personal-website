import sizes from './imageSizes.json';

const table = sizes as Record<string, { width: number; height: number }>;

export function sizeForImage(src: string): { width: number; height: number } | undefined {
    const clean = src.split('?')[0];
    const match = clean.match(/\/images\/(?:origami|projects)\/([^/]+)\/([^/]+)\.(?:webp|png|jpe?g)$/i);
    if (!match) return undefined;
    const stem = match[2].replace(/-[A-Za-z0-9_-]{8}$/, '');
    return table[`${match[1]}/${stem}`];
}
