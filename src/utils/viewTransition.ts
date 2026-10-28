import type { CSSProperties } from 'react';

/**
 * Style that pairs a piece's image across pages, so a View Transition grows the
 * card image into the detail page's carousel (and back). Only one element per
 * page may carry a given name, so pass active only for the one that should move.
 */
export function exhibitTransition(slug: string, active = true): CSSProperties | undefined {
    if (!active) return undefined;
    return { viewTransitionName: `exhibit-${slug.replace(/[^a-zA-Z0-9_-]/g, '-')}` };
}

const previews = new Map<string, string>();

/** Remembers the copy of a piece's image already on screen when its link is followed. */
export function rememberPreview(slug: string, img: HTMLImageElement | null) {
    if (img?.complete && img.currentSrc) previews.set(slug, img.currentSrc);
}

/**
 * That copy, for the piece's page to show while its larger image loads, so the
 * picture that just moved there doesn't drop back to a blur.
 */
export function previewFor(slug: string) {
    return previews.get(slug);
}
