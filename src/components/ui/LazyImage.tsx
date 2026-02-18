import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    onClick?: () => void;
    title?: string;
    width?: string | number;
    height?: string | number;
    priority?: boolean;
}

/**
 * LazyImage — defers image loading with IntersectionObserver.
 * Priority images render immediately with fetchpriority="high".
 * No per-image opacity animation; entrance effects are handled
 * by the parent's stagger animation to avoid conflicts.
 */
export function LazyImage({
    src,
    alt,
    className = '',
    onClick,
    title,
    width,
    height,
    priority = false,
}: LazyImageProps) {
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (priority || isInView) return;

        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(el);
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(el);
        return () => { observer.unobserve(el); };
    }, [priority, isInView]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {(priority || isInView) && src && !hasError ? (
                <img
                    src={src}
                    alt={alt}
                    title={title}
                    onClick={onClick}
                    className={`w-full h-full object-contain ${onClick ? 'cursor-pointer' : ''}`}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding={priority ? 'sync' : 'async'}
                    fetchPriority={priority ? 'high' : undefined}
                    onError={() => setHasError(true)}
                    width={width}
                    height={height}
                />
            ) : hasError ? (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-tertiary)] text-sm">
                    Failed to load
                </div>
            ) : null}
        </div>
    );
}
