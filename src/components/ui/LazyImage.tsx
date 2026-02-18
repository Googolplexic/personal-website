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
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (priority) {
            setIsInView(true);
            return;
        }

        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(el);
                }
            },
            { rootMargin: '200px' } // start loading 200px before visible
        );

        observer.observe(el);
        return () => { observer.unobserve(el); };
    }, [priority]);

    // Preload image in memory for smooth fade-in
    useEffect(() => {
        if (!isInView || !src) return;
        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setHasError(true);
        img.src = src;
    }, [isInView, src]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Skeleton placeholder */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 img-skeleton rounded-xl" />
            )}

            {/* Actual image */}
            {isInView && src && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    title={title}
                    onClick={onClick}
                    className={`w-full h-full object-contain ${priority ? '' : 'transition-opacity duration-500'} ${priority || isLoaded ? 'opacity-100' : 'opacity-0'
                        } ${onClick ? 'cursor-pointer' : ''}`}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding={priority ? 'sync' : 'async'}
                    width={width}
                    height={height}
                />
            )}

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-tertiary)] text-sm">
                    Failed to load
                </div>
            )}
        </div>
    );
}
