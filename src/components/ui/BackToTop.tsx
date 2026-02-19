import { useState, useEffect, useRef } from 'react';
import { getLenis } from '../../utils/useSmoothScroll';

/**
 * Subtle back-to-top button that appears after scrolling down.
 * Uses Lenis smooth scroll when available, falls back to native.
 */
export function BackToTop() {
    const [visible, setVisible] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > 400);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        // Hide immediately via DOM — don't wait for React re-render
        if (btnRef.current) {
            btnRef.current.style.opacity = '0';
            btnRef.current.style.transform = 'translateY(12px)';
            btnRef.current.style.pointerEvents = 'none';
        }
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
            ref={btnRef}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-8 right-8 z-[150] p-3 rounded-full transition-all duration-500"
            style={{
                opacity: visible ? 0.7 : 0,
                pointerEvents: visible ? 'auto' : 'none',
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                backgroundColor: 'var(--nav-bg)',
                border: '1px solid var(--nav-border)',
                backdropFilter: 'blur(16px) saturate(1.2)',
                WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
            }}
            onMouseEnter={(e) => {
                if (!visible) return;
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.opacity = visible ? '0.7' : '0';
                e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--color-accent)' }}
            >
                <path d="M18 15l-6-6-6 6" />
            </svg>
        </button>
    );
}
