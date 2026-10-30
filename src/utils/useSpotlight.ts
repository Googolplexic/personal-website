import { useCallback, useEffect, useRef } from 'react';

/** Keeps the card the pointer was last on marked, including while it crosses the gap before the next one. */
function holdLit(group: HTMLDivElement, target: EventTarget | null) {
    const item = target instanceof Element ? target.closest('.spotlight-item') : null;
    if (!item || !group.contains(item)) return;
    const current = group.querySelector('[data-lit]');
    if (current === item) return;
    current?.removeAttribute('data-lit');
    item.setAttribute('data-lit', '');
}

/**
 * useSpotlight — tracks mouse position over a container
 * and writes CSS custom properties on the global #global-spotlight
 * element so it's never clipped by ancestor transforms.
 */
export function useSpotlight(enabled = true) {
    const ref = useRef<HTMLDivElement>(null);

    // Hide spotlight when component unmounts or scrolls out of view
    useEffect(() => {
        if (!enabled) return;
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
    }, [enabled]);

    const isHoverDevice = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isSpotlightDisabled = () => document.documentElement.classList.contains('spotlight-disabled');

    const pointerRef = useRef({ x: 0, y: 0 });
    const frameRef = useRef(0);
    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!enabled || !isHoverDevice() || isSpotlightDisabled()) return;
        holdLit(e.currentTarget, e.target);
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
    }, [enabled]);

    const onMouseEnter = useCallback(() => {
        if (!enabled || !isHoverDevice() || isSpotlightDisabled()) return;
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
    }, [enabled]);

    const onMouseLeave = useCallback(() => {
        if (!enabled) return;
        ref.current?.querySelector('[data-lit]')?.removeAttribute('data-lit');
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
    }, [enabled]);

    return { ref, onMouseMove, onMouseEnter, onMouseLeave };
}
