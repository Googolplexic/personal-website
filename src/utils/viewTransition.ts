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

/** Safari and every other browser on iPhone and iPad (iPadOS reports itself as a Mac). */
function isIOS() {
    return /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

/** .page-enter's fade, for a page that was already rendered expecting a View Transition */
function fadeInPage() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const easing = getComputedStyle(document.documentElement).getPropertyValue('--ease-gallery').trim() || 'ease-out';
    document.querySelector('[data-page]')?.animate({ opacity: [0, 1] }, { duration: 350, easing });
}

/**
 * Turns each moving picture's size-and-position animation into a transform.
 * The browser's own animates width and height, which runs on the main thread,
 * so while the new page is busy loading Firefox holds the picture still and
 * then jumps it along. A transform runs off the main thread. The card and the
 * page's picture have the same shape, so the scale is the same both ways.
 */
function moveExhibitsByTransform() {
    for (const animation of document.getAnimations()) {
        const effect = animation.effect;
        if (!(effect instanceof KeyframeEffect) || !effect.pseudoElement?.startsWith('::view-transition-group(exhibit-')) continue;
        const [from] = effect.getKeyframes();
        if (typeof from?.transform !== 'string' || typeof from.width !== 'string' || typeof from.height !== 'string') continue;
        try {
            effect.setKeyframes([]);
            const end = getComputedStyle(document.documentElement, effect.pseudoElement);
            const scaleX = parseFloat(from.width) / parseFloat(end.width);
            const scaleY = parseFloat(from.height) / parseFloat(end.height);
            if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) throw new RangeError('no size to scale from');
            effect.setKeyframes([
                { transform: `${from.transform} scale(${scaleX}, ${scaleY})`, easing: end.animationTimingFunction },
                { transform: end.transform },
            ]);
        } catch {
            effect.setKeyframes([from]);
        }
    }
}

/**
 * Skips the View Transitions that would flash, so those pages swap at once
 * (with .page-enter's fade) instead:
 * - Phones animate going back themselves (the back gesture, Safari's swipe), and a
 *   transition on top would replay the page being left before showing the one returned to.
 * - On iOS, a transition that starts scrolled down or changes the scroll position
 *   shows the new page for a frame, then the old one, then animates.
 */
export function skipFlashingTransitions() {
    const start = document.startViewTransition?.bind(document);
    if (!start) return () => {};
    const ios = isIOS();
    let skipNext = false;
    let timer = 0;

    const onPop = (event: PopStateEvent) => {
        if (!event.hasUAVisualTransition && !window.matchMedia('(pointer: coarse)').matches) return;
        skipNext = true;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => { skipNext = false; }, 1000);
    };

    const skip = (transition: ViewTransition) => {
        transition.ready.catch(() => {});
        transition.skipTransition();
    };

    document.startViewTransition = (update?: Parameters<typeof start>[0]) => {
        const scrollY = window.scrollY;
        const transition: ViewTransition = start(ios && typeof update === 'function'
            ? async () => {
                await update();
                if (window.scrollY === scrollY) return;
                skip(transition);
                fadeInPage();
            }
            : update);
        if (skipNext || (ios && scrollY > 0)) {
            skipNext = false;
            skip(transition);
        } else {
            transition.ready.then(moveExhibitsByTransform, () => {});
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
