import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/styles';

const CONTROL_CLASS = 'absolute z-10 w-11 h-11 p-0 flex items-center justify-center cursor-pointer border border-solid border-line-strong bg-canvas/70 text-ink transition-colors duration-300 hover:border-gold hover:text-gold';

export interface LightboxImage {
    src: string;
    width?: number;
    height?: number;
    /** The copy already shown on the page, drawn underneath until src arrives */
    preview?: { src: string; srcSet?: string; sizes?: string };
}

interface LightboxProps {
    images: LightboxImage[];
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
    const closeRef = useRef<HTMLButtonElement>(null);

    // Focus moves into the dialog, and back to whatever opened it on close
    useEffect(() => {
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        closeRef.current?.focus();
        return () => opener?.focus();
    }, []);

    const currentImage = images[currentIndex];
    const hasMultiple = images.length > 1;

    // Start fetching the neighbours so the arrows don't wait on the network
    useEffect(() => {
        if (images.length < 2) return;
        for (const offset of [1, -1]) {
            new Image().src = images[(currentIndex + offset + images.length) % images.length].src;
        }
    }, [currentIndex, images]);

    // A frame with the image's proportions lets the preview and the full copy sit exactly on top of each other
    const { width, height, preview } = currentImage;
    const frameStyle = width && height ? {
        width: `min(90vw, calc(85vh * ${width / height}), ${width}px)`,
        aspectRatio: `${width} / ${height}`,
    } : undefined;

    // Animate in
    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setIsEntering(false));
        });
    }, []);

    // Lock body scroll (class also disables the custom scrollbar cursor)
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.classList.add('scroll-locked');
        return () => {
            document.body.style.overflow = '';
            document.documentElement.classList.remove('scroll-locked');
        };
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
                case 'Tab': {
                    // Keep focus cycling through the dialog's own controls
                    const controls = containerRef.current?.querySelectorAll<HTMLElement>('button');
                    if (!controls?.length) break;
                    const first = controls[0];
                    const last = controls[controls.length - 1];
                    const active = document.activeElement;
                    if (!containerRef.current?.contains(active) || (e.shiftKey ? active === first : active === last)) {
                        e.preventDefault();
                        (e.shiftKey ? last : first).focus();
                    }
                    break;
                }
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
            role="dialog"
            aria-modal="true"
            aria-label={alt}
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
                ref={closeRef}
                type="button"
                onClick={handleClose}
                className={cn(CONTROL_CLASS, 'top-5 right-5')}
                aria-label="Close lightbox"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            {/* Counter */}
            {hasMultiple && (
                <div
                    className="absolute top-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] uppercase font-body text-ink-faint"
                >
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Navigation arrows */}
            {hasMultiple && (
                <>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }}
                        className={cn(CONTROL_CLASS, 'left-4 top-1/2 -translate-y-1/2')}
                        aria-label="Previous image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }}
                        className={cn(CONTROL_CLASS, 'right-4 top-1/2 -translate-y-1/2')}
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
                <div
                    className="relative"
                    onClick={handleImageClick}
                    onMouseMove={handleMouseMove}
                    style={{
                        ...frameStyle,
                        cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                        transition: 'transform 0.3s var(--ease-gallery)',
                    }}
                >
                    {frameStyle && preview && (
                        <img
                            key={`preview-${currentIndex}`}
                            src={preview.src}
                            srcSet={preview.srcSet}
                            sizes={preview.sizes}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain"
                            draggable={false}
                        />
                    )}
                    <img
                        key={currentIndex}
                        src={currentImage.src}
                        alt={`${alt} ${currentIndex + 1}`}
                        data-fade
                        className={frameStyle ? 'absolute inset-0 w-full h-full object-contain' : 'block max-w-[90vw] max-h-[85vh] object-contain'}
                        draggable={false}
                    />
                </div>
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
                                backgroundColor: 'var(--color-ink-muted)',
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
