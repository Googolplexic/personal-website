import { useEffect, RefObject } from 'react';

/**
 * useScrollProximity — on touch/no-hover devices, dims spotlight-item
 * children based on their distance from the viewport center.
 * Cards near the center are fully bright; cards near edges dim slightly.
 * On devices with hover (desktop), this is a no-op.
 */
export function useScrollProximity(containerRef: RefObject<HTMLDivElement | null>) {
    useEffect(() => {
        // Only activate on touch / no-hover devices
        // Using pointer: fine to avoid false positives on Chrome Android
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const container = containerRef.current;
        if (!container) return;

        let ticking = false;
        let enabled = false;
        let initTimer: number | null = null;
        let idleId: number | null = null;

        const update = () => {
            const items = container.querySelectorAll<HTMLElement>('.spotlight-item');
            // Offset center slightly downward to account for navbar
            const viewportCenter = window.innerHeight * 0.53;
            // Cards within this range of the center are fully bright
            const fullBrightRange = window.innerHeight * 0.22;
            // Cards beyond this range are at minimum brightness
            const fadeRange = window.innerHeight * 0.65;

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.bottom < -220 || rect.top > window.innerHeight + 220) {
                    item.style.opacity = '';
                    item.style.filter = '';
                    return;
                }
                const itemCenter = rect.top + rect.height / 2;
                const distance = Math.abs(itemCenter - viewportCenter);

                let t: number;
                if (distance <= fullBrightRange) {
                    t = 1;
                } else if (distance >= fadeRange) {
                    t = 0;
                } else {
                    // Smoothstep interpolation for natural falloff
                    const raw = 1 - (distance - fullBrightRange) / (fadeRange - fullBrightRange);
                    t = raw * raw * (3 - 2 * raw);
                }

                // Keep to opacity only; filter-based brightness is expensive on mobile.
                const opacity = 0.2 + t * 0.8;

                item.style.opacity = String(opacity);
                item.style.filter = '';
            });

            ticking = false;
        };

        const onScroll = () => {
            if (!enabled) return;
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        // Delay activation until browser is idle so this never competes with LCP.
        const enableAndRun = () => {
            enabled = true;
            requestAnimationFrame(() => {
                requestAnimationFrame(update);
            });
        };
        const ric = (window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        }).requestIdleCallback;
        if (ric) {
            idleId = ric(enableAndRun, { timeout: 2500 });
        } else {
            initTimer = window.setTimeout(enableAndRun, 1800);
        }
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (initTimer !== null) window.clearTimeout(initTimer);
            if (idleId !== null) {
                const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
                if (cic) cic(idleId);
            }
            // Clean up inline styles
            const items = container.querySelectorAll<HTMLElement>('.spotlight-item');
            items.forEach(item => {
                item.style.opacity = '';
                item.style.filter = '';
            });
        };
    }, [containerRef]);
}
