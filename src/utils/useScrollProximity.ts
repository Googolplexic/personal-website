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

                // Map t to opacity range [0.3, 1] and brightness [0.35, 1.0]
                const opacity = 0.2 + t * 0.8;
                const brightness = 0.35 + t * 0.65;

                item.style.opacity = String(opacity);
                item.style.filter = `brightness(${brightness})`;
            });

            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        // Initial run + listen for scroll
        update();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            // Clean up inline styles
            const items = container.querySelectorAll<HTMLElement>('.spotlight-item');
            items.forEach(item => {
                item.style.opacity = '';
                item.style.filter = '';
            });
        };
    }, [containerRef]);
}
