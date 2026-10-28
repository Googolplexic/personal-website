import type { ImageSet } from '../types';

/** Width of the WebP copy images.server.ts writes into ImageSet.placeholder */
export const PLACEHOLDER_WIDTH = 8;

/**
 * The tiny copy stretched over the image's box inside an SVG blur, so it reads as a soft
 * preview rather than pixels. The alpha table keeps the blurred edge from fading out.
 * Only < > # need escaping inside url("…"), which keeps the markup short.
 */
export function blurredPlaceholderUrl({ placeholder, width, height }: ImageSet) {
    const blur = width / PLACEHOLDER_WIDTH / 2;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'><filter id='b' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='${blur}'/><feComponentTransfer><feFuncA type='discrete' tableValues='1 1'/></feComponentTransfer></filter><image width='100%' height='100%' preserveAspectRatio='none' filter='url(%23b)' href='${placeholder}'/></svg>`;
    return `data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E')}`;
}
