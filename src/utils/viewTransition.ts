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

/**
 * Unpairs images that are off screen, so a picture doesn't fly in from (or off
 * to) somewhere the visitor can't see; it fades with its page instead.
 */
export function dropOffscreenNames() {
    document.querySelectorAll<HTMLElement>('.vt-exhibit').forEach((el) => {
        if (!el.style.viewTransitionName) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) el.style.viewTransitionName = '';
    });
}

/**
 * Phones animate going back themselves (the back gesture, Safari's swipe), and a
 * View Transition on top would replay the page being left before showing the
 * one returned to. There, going back swaps the page at once.
 */
export function skipTransitionsOnBrowserBack() {
    const start = document.startViewTransition?.bind(document);
    if (!start) return () => {};
    let skipNext = false;
    let timer = 0;

    const onPop = (event: PopStateEvent) => {
        if (!event.hasUAVisualTransition && !window.matchMedia('(pointer: coarse)').matches) return;
        skipNext = true;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => { skipNext = false; }, 1000);
    };

    document.startViewTransition = (update?: Parameters<typeof start>[0]) => {
        const transition = start(update);
        if (skipNext) {
            skipNext = false;
            transition.ready.catch(() => {});
            transition.skipTransition();
        }
        return transition;
    };
    window.addEventListener('popstate', onPop, true);

    return () => {
        window.removeEventListener('popstate', onPop, true);
        window.clearTimeout(timer);
        document.startViewTransition = start;
    };
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
