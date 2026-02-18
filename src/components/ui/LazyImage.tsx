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
 * LazyImage — loads images with IntersectionObserver,
 * shows a shimmer skeleton placeholder, and fades in on load.
 *
 * Priority images skip all JS preloading and render immediately
 * with fetchpriority="high" so the browser can start the fetch ASAP.
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
    const [isLoaded, setIsLoaded] = useState(priority);
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

    useEffect(() => {
        if (priority || !isInView || !src) return;
        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setHasError(true);
        img.src = src;
    }, [priority, isInView, src]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 img-skeleton rounded-xl" />
            )}

            {(priority || isInView) && src && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    title={title}
                    onClick={onClick}
                    className={`w-full h-full object-contain ${priority ? '' : 'transition-opacity duration-500'} ${isLoaded ? 'opacity-100' : 'opacity-0'
                        } ${onClick ? 'cursor-pointer' : ''}`}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding={priority ? 'sync' : 'async'}
                    fetchPriority={priority ? 'high' : undefined}
                    onLoad={priority ? undefined : () => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    width={width}
                    height={height}
                />
            )}

            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-tertiary)] text-sm">
                    Failed to load
                </div>
            )}
        </div>
    );
}
