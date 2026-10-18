import { useState, useEffect } from 'react';
import { getLenis } from '../../utils/useSmoothScroll';

/**
 * Subtle back-to-top button that appears after scrolling down.
 * Uses Lenis smooth scroll when available, falls back to native.
 */
export function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > 400);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        setVisible(false);
        const lenis = getLenis();
        if (lenis) {
            lenis.scrollTo(0, { duration: 1.2 });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Back to top"
            data-visible={visible}
            className="fixed bottom-8 right-8 z-150 p-3 rounded-full transition-all duration-500 border border-solid border-(--nav-border) bg-(--nav-bg) backdrop-blur-lg backdrop-saturate-120 opacity-0 pointer-events-none translate-y-3 data-[visible=true]:opacity-70 data-[visible=true]:pointer-events-auto data-[visible=true]:translate-y-0 data-[visible=true]:hover:opacity-100 hover:border-gold"
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round" className="text-gold"
            >
                <path d="M18 15l-6-6-6 6" />
            </svg>
        </button>
    );
}
