import { useCallback, useEffect, useRef } from 'react';

/**
 * useSpotlight — tracks mouse position over a container
 * and writes CSS custom properties on the global #global-spotlight
 * element so it's never clipped by ancestor transforms.
 */
export function useSpotlight() {
    const ref = useRef<HTMLDivElement>(null);

    // Hide spotlight when component unmounts or scrolls out of view
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    const overlay = document.getElementById('global-spotlight');
                    if (overlay) overlay.classList.remove('visible');
                }
            },
            { threshold: 0 }
        );
        observer.observe(el);

        return () => {
            observer.disconnect();
            const overlay = document.getElementById('global-spotlight');
            if (overlay) overlay.classList.remove('visible');
        };
    }, []);

    const isHoverDevice = () => window.matchMedia('(hover: hover)').matches;

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isHoverDevice()) return;
        const overlay = document.getElementById('global-spotlight');
        if (!overlay) return;
        overlay.style.setProperty('--spot-x', `${e.clientX}px`);
        overlay.style.setProperty('--spot-y', `${e.clientY}px`);
    }, []);

    const onMouseEnter = useCallback(() => {
        if (!isHoverDevice()) return;
        const overlay = document.getElementById('global-spotlight');
        if (overlay) overlay.classList.add('visible');
    }, []);

    const onMouseLeave = useCallback(() => {
        const overlay = document.getElementById('global-spotlight');
        if (overlay) overlay.classList.remove('visible');
    }, []);

    return { ref, onMouseMove, onMouseEnter, onMouseLeave };
}
