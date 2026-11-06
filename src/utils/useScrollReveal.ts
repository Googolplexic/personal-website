import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/** instant: it was already on screen when the page arrived, so it shows without sliding in */
type Reveal = false | 'animate' | 'instant';

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
    const [revealed, setRevealed] = useState<Reveal>(false);

    // Coming back to a page restores its scroll position. Anything on screen then shows
    // as it was left, so a picture moving back into it doesn't land and then slide.
    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        let cancelled = false;
        // The router restores the scroll position later in this same commit
        queueMicrotask(() => {
            if (cancelled || element.getBoundingClientRect().top >= window.innerHeight) return;
            // The class goes on before the next paint; the state keeps it there
            element.classList.add('revealed', 'reveal-instant');
            setRevealed('instant');
        });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRevealed((current) => current || 'animate');
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setRevealed(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isRevealed: Boolean(revealed), instant: revealed === 'instant' };
}

/**
 * Convenience component wrapper for scroll reveal sections.
 * Usage: wrap any section in <ScrollRevealSection> for auto fade-in.
 */
export function useScrollRevealClass(
    options: ScrollRevealOptions = {}
) {
    const { ref, isRevealed, instant } = useScrollReveal<HTMLElement>(options);
    return {
        ref: ref as React.RefObject<HTMLElement>,
        className: `scroll-reveal${isRevealed ? ' revealed' : ''}${instant ? ' reveal-instant' : ''}`,
    };
}
