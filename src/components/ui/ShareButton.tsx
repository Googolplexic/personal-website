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

    const linkStyle = {
        color: 'var(--color-text-tertiary)',
        background: 'none',
        border: 'none',
        padding: '10px 0',
        minHeight: 44,
        cursor: 'pointer',
        boxSizing: 'border-box' as const,
    };

    const shareIcon = (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
    );

    const checkIcon = (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );

    return (
        <button
            type="button"
            onClick={handleShare}
            className={`block text-xs tracking-[0.15em] uppercase font-body transition-colors ${className}`}
            style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
            title={state === 'copied' ? 'Link copied!' : 'Share'}
            aria-label="Share"
        >
            {state === 'copied' ? (
                <>Copied{checkIcon}</>
            ) : (
                <>Share{shareIcon}</>
            )}
        </button>
    );
}
