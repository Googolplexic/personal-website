import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook to reveal elements when they scroll into view.
 * Uses IntersectionObserver for performance.
 * Reduced motion is handled in CSS (`.scroll-reveal` in motion.css).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options: ScrollRevealOptions = {}
) {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
    const ref = useRef<T>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsRevealed(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsRevealed(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isRevealed };
}

/**
 * Convenience component wrapper for scroll reveal sections.
 * Usage: wrap any section in <ScrollRevealSection> for auto fade-in.
 */
export function useScrollRevealClass(
    options: ScrollRevealOptions = {}
) {
    const { ref, isRevealed } = useScrollReveal<HTMLElement>(options);
    return {
        ref: ref as React.RefObject<HTMLElement>,
        className: `scroll-reveal${isRevealed ? ' revealed' : ''}`,
    };
}
