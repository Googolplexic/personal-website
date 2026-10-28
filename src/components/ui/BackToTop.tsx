import { useState, useEffect } from 'react';

/**
 * Subtle back-to-top button that appears after scrolling down.
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Back to top"
            data-visible={visible}
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-[calc(1.5rem+env(safe-area-inset-right))] md:bottom-[calc(2rem+env(safe-area-inset-bottom))] md:right-[calc(2rem+env(safe-area-inset-right))] z-150 w-11 h-11 p-0 flex items-center justify-center transition-all duration-500 border border-solid border-line-strong bg-(--nav-bg) backdrop-blur-lg backdrop-saturate-120 opacity-0 pointer-events-none translate-y-3 data-[visible=true]:opacity-70 data-[visible=true]:pointer-events-auto data-[visible=true]:translate-y-0 data-[visible=true]:hover:opacity-100 hover:border-gold"
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
