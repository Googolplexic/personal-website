import { useEffect, useRef, useState, RefObject } from 'react';

/**
 * Hook to stagger the reveal of child items within a container.
 * Each .spotlight-item inside the container gets revealed one-by-one
 * with a configurable delay, like lights turning on in a gallery.
 * 
 * Uses IntersectionObserver — only triggers when container enters view.
 * Respects prefers-reduced-motion.
 * 
 * Pass an existing ref to attach to, or omit to create a new one.
 */
export function useStaggeredEntrance(
    externalRef?: RefObject<HTMLDivElement | null>,
    staggerDelay = 80
) {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = externalRef || internalRef;
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        if (hasTriggered) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setHasTriggered(true);
            return;
        }

        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const items = container.querySelectorAll<HTMLElement>('.spotlight-item');

                    items.forEach((item) => {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        item.style.transition = 'none';
                    });

                    // Force reflow
                    void container.offsetHeight;

                    items.forEach((item, i) => {
                        setTimeout(() => {
                            item.style.transition = 'opacity 0.6s cubic-bezier(.4,0,.2,1), transform 0.6s cubic-bezier(.4,0,.2,1)';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, i * staggerDelay);
                    });

                    // Clean up inline styles after all animations complete
                    setTimeout(() => {
                        items.forEach(item => {
                            item.style.transition = '';
                            item.style.opacity = '';
                            item.style.transform = '';
                        });
                    }, items.length * staggerDelay + 800);

                    setHasTriggered(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, [hasTriggered, staggerDelay]);

    return containerRef;
}
