import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenisInstance: Lenis | null = null;

/**
 * Global smooth scroll via Lenis.
 * Call once in the app root. Respects prefers-reduced-motion.
 * Imported up front so the first wheel event is already smoothed, instead of
 * a native scroll that Lenis then takes over.
 */
export function useSmoothScroll(enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        // Smooth scrolling is a desktop enhancement; skip on touch/coarse pointers.
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let destroyed = false;
        let rafId: number | null = null;

        // lerp rather than a timed ease: each wheel tick used to restart a 0.7s curve
        const lenis = new Lenis({ lerp: 0.12, touchMultiplier: 1.2 });
        lenisInstance = lenis;

        function raf(time: number) {
            if (destroyed) return;
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        // Lenis watches the document size itself; one extra pass after load catches webfonts
        const onLoad = () => {
            if (!destroyed) lenis.resize();
        };
        if (document.readyState === 'complete') requestAnimationFrame(onLoad);
        else window.addEventListener('load', onLoad);
        const timeoutId = window.setTimeout(onLoad, 500);

        return () => {
            window.removeEventListener('load', onLoad);
            window.clearTimeout(timeoutId);
            destroyed = true;
            if (rafId != null) cancelAnimationFrame(rafId);
            if (lenisInstance) {
                lenisInstance.destroy();
                lenisInstance = null;
            }
        };
    }, [enabled]);
}

/** Expose for scroll-to calls (e.g., back-to-top) */
export function getLenis() {
    return lenisInstance;
}
