import { useEffect } from 'react';

let lenisInstance: any = null;

/**
 * Global smooth scroll via Lenis.
 * Call once in the app root. Respects prefers-reduced-motion.
 * Lenis is loaded asynchronously to keep it off the critical rendering path.
 */
export function useSmoothScroll() {
    useEffect(() => {
        // Smooth scrolling is a desktop enhancement; skip on touch/coarse pointers.
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let destroyed = false;
        let rafId: number | null = null;
        let loadCleanup: (() => void) | null = null;

        import('lenis').then(({ default: Lenis }) => {
            if (destroyed) return;

            const lenis = new Lenis({
                duration: 0.8,
                easing: (t: number) => 1 - Math.pow(1 - t, 3),
                touchMultiplier: 1.2,
            });

            lenisInstance = lenis;

            function raf(time: number) {
                if (destroyed) return;
                lenis.raf(time);
                rafId = requestAnimationFrame(raf);
            }

            rafId = requestAnimationFrame(raf);

            // Recalculate scroll dimensions after load so first-load scroll works (Lenis
            // can attach before layout is final — e.g. lazy content or fonts).
            const onLoad = () => {
                if (destroyed || !lenisInstance) return;
                lenis.resize();
            };
            if (document.readyState === 'complete') {
                requestAnimationFrame(onLoad);
            } else {
                window.addEventListener('load', onLoad);
            }
            const timeoutId = window.setTimeout(onLoad, 500);
            loadCleanup = () => {
                window.removeEventListener('load', onLoad);
                window.clearTimeout(timeoutId);
            };
        });

        return () => {
            loadCleanup?.();
            destroyed = true;
            if (rafId != null) cancelAnimationFrame(rafId);
            if (lenisInstance) {
                lenisInstance.destroy();
                lenisInstance = null;
            }
        };
    }, []);
}

/** Expose for scroll-to calls (e.g., back-to-top) */
export function getLenis() {
    return lenisInstance;
}
