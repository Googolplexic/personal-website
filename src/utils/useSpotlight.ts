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
                    const dim = document.getElementById('page-dim');
                    if (overlay) overlay.classList.remove('visible');
                    if (dim) dim.classList.remove('visible');
                }
            },
            { threshold: 0 }
        );
        observer.observe(el);

        return () => {
            observer.disconnect();
            const overlay = document.getElementById('global-spotlight');
            const dim = document.getElementById('page-dim');
            if (overlay) overlay.classList.remove('visible');
            if (dim) dim.classList.remove('visible');
        };
    }, []);

    const isHoverDevice = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isSpotlightDisabled = () => document.documentElement.classList.contains('spotlight-disabled');

    const pointerRef = useRef({ x: 0, y: 0 });
    const frameRef = useRef(0);
    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isHoverDevice() || isSpotlightDisabled()) return;
        pointerRef.current = { x: e.clientX, y: e.clientY };
        if (frameRef.current) return;
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0;
            const { x, y } = pointerRef.current;
            for (const id of ['global-spotlight', 'page-dim']) {
                const el = document.getElementById(id);
                el?.style.setProperty('--spot-x', `${x}px`);
                el?.style.setProperty('--spot-y', `${y}px`);
            }
        });
    }, []);

    const onMouseEnter = useCallback(() => {
        if (!isHoverDevice() || isSpotlightDisabled()) return;
        const overlay = document.getElementById('global-spotlight');
        const dim = document.getElementById('page-dim');
        if (overlay) {
            overlay.classList.remove('expanding');
            overlay.classList.add('visible');
        }
        if (dim) {
            dim.classList.remove('expanding');
            dim.classList.add('visible');
        }
    }, []);

    const onMouseLeave = useCallback(() => {
        const overlay = document.getElementById('global-spotlight');
        const dim = document.getElementById('page-dim');
        if (overlay) {
            overlay.classList.remove('visible');
            overlay.classList.add('expanding');
            const cleanup = () => {
                overlay.classList.remove('expanding');
                overlay.removeEventListener('transitionend', cleanup);
            };
            overlay.addEventListener('transitionend', cleanup);
        }
        if (dim) {
            dim.classList.remove('visible');
            dim.classList.add('expanding');
            const cleanup = () => {
                dim.classList.remove('expanding');
                dim.removeEventListener('transitionend', cleanup);
            };
            dim.addEventListener('transitionend', cleanup);
        }
    }, []);

    return { ref, onMouseMove, onMouseEnter, onMouseLeave };
}
