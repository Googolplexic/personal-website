import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to stagger the reveal of child items within a container.
 * Items below the fold are hidden, then revealed as they scroll into view,
 * one after another, like lights turning on in a gallery. Items already on
 * screen stay visible, since the page arrives prerendered.
 *
 * Respects prefers-reduced-motion and skips touch devices.
 * Pass an existing ref to attach to, or omit to create a new one.
 */
export function useStaggeredEntrance(
    externalRef?: RefObject<HTMLDivElement | null>,
    staggerDelay = 80,
    /** Number of items to show immediately (no stagger) for LCP */
    skipCount = 0,
    /** Change this when the items are re-rendered into new elements */
    layoutKey?: unknown
) {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = externalRef || internalRef;

    useEffect(() => {
        // On touch devices, skip stagger animation to reduce first-load main-thread work.
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const container = containerRef.current;
        if (!container) return;

        const staggerIndex = (item: HTMLElement) =>
            Number((item.closest('[data-stagger-index]') as HTMLElement | null)?.dataset.staggerIndex ?? 0);
        const items = Array.from(container.querySelectorAll<HTMLElement>('.spotlight-item'))
            .sort((a, b) => staggerIndex(a) - staggerIndex(b));

        const viewportBottom = window.innerHeight;
        const pending = items.filter((item, i) => i >= skipCount && item.getBoundingClientRect().top > viewportBottom);
        pending.forEach(item => item.classList.add('stagger-hidden'));

        const timers: number[] = [];
        const observer = new IntersectionObserver(
            (entries) => {
                const entering = entries
                    .filter(entry => entry.isIntersecting)
                    .map(entry => entry.target as HTMLElement)
                    .sort((a, b) => staggerIndex(a) - staggerIndex(b));

                entering.forEach((item, i) => {
                    observer.unobserve(item);
                    timers.push(window.setTimeout(() => {
                        item.classList.remove('stagger-hidden');
                        item.classList.add('stagger-visible');
                        // Remove the animation class once it finishes, leaving no trace
                        timers.push(window.setTimeout(() => item.classList.remove('stagger-visible'), 700));
                    }, i * staggerDelay));
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
        );

        pending.forEach(item => observer.observe(item));

        return () => {
            observer.disconnect();
            timers.forEach(timer => window.clearTimeout(timer));
            items.forEach(item => {
                item.classList.remove('stagger-hidden');
                item.classList.remove('stagger-visible');
            });
        };
    }, [containerRef, staggerDelay, skipCount, layoutKey]);

    return containerRef;
}
