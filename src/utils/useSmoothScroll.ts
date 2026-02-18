import { useEffect } from 'react';

let lenisInstance: any = null;

/**
 * Global smooth scroll via Lenis.
 * Call once in the app root. Respects prefers-reduced-motion.
 * Lenis is loaded asynchronously to keep it off the critical rendering path.
 */
export function useSmoothScroll() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let destroyed = false;

        import('lenis').then(({ default: Lenis }) => {
            if (destroyed) return;

            const lenis = new Lenis({
                duration: 0.8,
                easing: (t: number) => 1 - Math.pow(1 - t, 3),
                touchMultiplier: 1.2,
            });

            lenisInstance = lenis;

            function raf(time: number) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);
        });

        return () => {
            destroyed = true;
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
