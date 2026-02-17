import { useCallback, useRef } from 'react';

/**
 * useSpotlight — tracks mouse position over a container
 * and writes CSS custom properties on the global #global-spotlight
 * element so it’s never clipped by ancestor transforms.
 */
export function useSpotlight() {
    const ref = useRef<HTMLDivElement>(null);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const overlay = document.getElementById('global-spotlight');
        if (!overlay) return;
        overlay.style.setProperty('--spot-x', `${e.clientX}px`);
        overlay.style.setProperty('--spot-y', `${e.clientY}px`);
    }, []);

    const onMouseEnter = useCallback(() => {
        const overlay = document.getElementById('global-spotlight');
        if (overlay) overlay.classList.add('visible');
    }, []);

    const onMouseLeave = useCallback(() => {
        const overlay = document.getElementById('global-spotlight');
        if (overlay) overlay.classList.remove('visible');
    }, []);

    return { ref, onMouseMove, onMouseEnter, onMouseLeave };
}
