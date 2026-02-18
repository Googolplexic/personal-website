import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface LightboxProps {
    images: string[];
    initialIndex: number;
    alt?: string;
    onClose: () => void;
}

/**
 * Full-screen image lightbox with zoom, keyboard nav, and swipe on mobile.
 */
export function Lightbox({ images, initialIndex, alt = 'Image', onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isEntering, setIsEntering] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentImage = images[currentIndex];
    const hasMultiple = images.length > 1;

    // Animate in
    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setIsEntering(false));
        });
    }, []);

    // Lock body scroll
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, []);

    const goTo = useCallback((index: number) => {
        setIsZoomed(false);
        if (index < 0) setCurrentIndex(images.length - 1);
        else if (index >= images.length) setCurrentIndex(0);
        else setCurrentIndex(index);
    }, [images.length]);

    const handleClose = useCallback(() => {
        setIsEntering(true);
        setTimeout(onClose, 250);
    }, [onClose]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape': handleClose(); break;
                case 'ArrowLeft': goTo(currentIndex - 1); break;
                case 'ArrowRight': goTo(currentIndex + 1); break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [currentIndex, goTo, handleClose]);

    // Zoom on click (desktop)
    const handleImageClick = (e: React.MouseEvent) => {
        if (isZoomed) {
            setIsZoomed(false);
        } else {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setZoomPos({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
            });
            setIsZoomed(true);
        }
    };

    // Zoom pan
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isZoomed) return;
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setZoomPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    // Touch swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        if (isZoomed) return;
        setSwipeStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!swipeStart || isZoomed) return;
        const deltaX = e.touches[0].clientX - swipeStart.x;
        setSwipeOffset(deltaX);
    };

    const handleTouchEnd = () => {
        if (!swipeStart) return;
        if (Math.abs(swipeOffset) > 60 && hasMultiple) {
            goTo(swipeOffset > 0 ? currentIndex - 1 : currentIndex + 1);
        }
        setSwipeStart(null);
        setSwipeOffset(0);
    };

    // Click backdrop to close (but not on image)
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('lightbox-backdrop')) {
            handleClose();
        }
    };

    return createPortal(
        <div
            ref={containerRef}
            className="lightbox-backdrop"
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.92)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                opacity: isEntering ? 0 : 1,
                transition: 'opacity 0.25s ease',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Close button */}
            <button
                onClick={handleClose}
                className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer border-none p-0"
                style={{
                    color: 'var(--color-text-primary)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
                aria-label="Close lightbox"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            {/* Counter */}
            {hasMultiple && (
                <div
                    className="absolute top-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] uppercase font-body"
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Navigation arrows */}
            {hasMultiple && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer border-none p-0 z-10"
                        style={{
                            color: 'var(--color-text-primary)',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        aria-label="Previous image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer border-none p-0 z-10"
                        style={{
                            color: 'var(--color-text-primary)',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        aria-label="Next image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </>
            )}

            {/* Image */}
            <div
                className="flex items-center justify-center"
                style={{
                    maxWidth: '90vw',
                    maxHeight: '85vh',
                    transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
                    transition: swipeOffset ? 'none' : 'transform 0.3s ease',
                }}
            >
                <img
                    src={currentImage}
                    alt={`${alt} ${currentIndex + 1}`}
                    onClick={handleImageClick}
                    onMouseMove={handleMouseMove}
                    style={{
                        maxWidth: '90vw',
                        maxHeight: '85vh',
                        objectFit: 'contain',
                        cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
                    }}
                    draggable={false}
                />
            </div>

            {/* Dot indicators */}
            {hasMultiple && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); goTo(i); }}
                            className="w-8 h-0.5 border-none p-0 cursor-pointer transition-all duration-300"
                            style={{
                                backgroundColor: 'var(--color-text-secondary)',
                                opacity: i === currentIndex ? 1 : 0.3,
                            }}
                            aria-label={`View image ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
}
