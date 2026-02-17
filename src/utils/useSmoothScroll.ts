import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

/**
 * Global smooth scroll via Lenis.
 * Call once in the app root. Respects prefers-reduced-motion.
 */
export function useSmoothScroll() {
    useEffect(() => {
        // Respect reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

        return () => {
            lenis.destroy();
            lenisInstance = null;
        };
    }, []);
}

/** Expose for scroll-to calls (e.g., back-to-top) */
export function getLenis() {
    return lenisInstance;
}
