import { useState } from 'react';

interface ShareButtonProps {
    url: string;
    title: string;
    description?: string;
    className?: string;
}

export function ShareButton({ url, title, description, className = '' }: ShareButtonProps) {
    const [state, setState] = useState<'idle' | 'copied'>('idle');

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault(); // prevent parent <a> from following its href
        try {
            if (navigator.share) {
                await navigator.share({ url, title, text: description });
            } else {
                await navigator.clipboard.writeText(url);
                setState('copied');
                setTimeout(() => setState('idle'), 2000);
            }
        } catch {
            // User cancelled or permission denied — do nothing
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`inline-flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase font-body transition-colors ${className}`}
            style={{ color: 'var(--color-text-tertiary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
            title={state === 'copied' ? 'Link copied!' : 'Share'}
            aria-label="Share"
        >
            {state === 'copied' ? (
                <>
                    Copied
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </>
            ) : (
                <>
                    Share
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                </>
            )}
        </button>
    );
}
