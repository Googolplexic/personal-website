import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to stagger the reveal of child items within a container.
 * Each .spotlight-item inside the container gets revealed one-by-one
 * with a configurable delay, like lights turning on in a gallery.
 * 
 * Uses IntersectionObserver — only triggers once when container enters view.
 * Respects prefers-reduced-motion.
 * 
 * Pass an existing ref to attach to, or omit to create a new one.
 */
export function useStaggeredEntrance(
    externalRef?: RefObject<HTMLDivElement | null>,
    staggerDelay = 80,
    /** Number of items to show immediately (no stagger) for LCP */
    skipCount = 0
) {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = externalRef || internalRef;
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (hasTriggered.current) return;
        // On touch devices, skip stagger animation to reduce first-load main-thread work.
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            hasTriggered.current = true;
            return;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            hasTriggered.current = true;
            return;
        }

        const container = containerRef.current;
        if (!container) return;
        const items = container.querySelectorAll<HTMLElement>('.spotlight-item');

        // Pre-hide staggered items immediately so they never flash visible then hide.
        items.forEach((item, i) => {
            if (i >= skipCount) {
                item.classList.add('stagger-hidden');
            }
        });

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTriggered.current) {
                    hasTriggered.current = true;
                    observer.disconnect();

                    items.forEach((item, i) => {
                        if (i >= skipCount) {
                            setTimeout(() => {
                                item.classList.remove('stagger-hidden');
                                item.classList.add('stagger-visible');
                            }, (i - skipCount) * staggerDelay);
                        }
                    });

                    const staggeredCount = Math.max(0, items.length - skipCount);
                    // Remove animation class after all complete, leaving no trace
                    setTimeout(() => {
                        items.forEach(item => {
                            item.classList.remove('stagger-visible');
                        });
                    }, staggeredCount * staggerDelay + 700);
                }
            },
            { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
            items.forEach(item => {
                item.classList.remove('stagger-hidden');
                item.classList.remove('stagger-visible');
            });
        };
    }, [containerRef, staggerDelay]);

    return containerRef;
}
