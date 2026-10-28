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
