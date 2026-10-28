import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/styles';
import { Kbd } from './Kbd';

const CONTROL_CLASS = 'absolute z-10 w-11 h-11 p-0 flex items-center justify-center cursor-pointer border border-solid border-line-strong bg-canvas/70 text-ink transition-colors duration-300 hover:border-gold hover:text-gold';

// Clear of the notch and home indicator on phones with viewport-fit=cover
const TOP = 'top-[max(1.25rem,env(safe-area-inset-top))]';
const BOTTOM = 'bottom-[max(1.5rem,env(safe-area-inset-bottom))]';

const SETTLE = 'transform 0.35s var(--ease-gallery)';
/** Distance (px) or flick speed (px/ms) that turns a drag into a page turn or a dismiss */
const SWIPE_DISTANCE = 60;
const DISMISS_DISTANCE = 120;
const FLICK_SPEED = 0.5;
/** Movement before a touch counts as a drag, so taps still reach the buttons and zoom */
const DRAG_SLOP = 8;

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

interface Drag {
    startX: number;
    startY: number;
    /** Where the image was when the finger landed, so a drag can catch it mid-animation */
    baseX: number;
    baseY: number;
    axis: 'x' | 'y' | null;
    x: number;
    y: number;
    lastY: number;
    lastTime: number;
    lastX: number;
    velocityX: number;
    velocityY: number;
}

/**
 * Full-screen image lightbox with zoom, keyboard nav, and touch gestures:
 * swipe sideways to change image, swipe up or down to close.
 */
export function Lightbox({ images, initialIndex, alt = 'Image', onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [isEntering, setIsEntering] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dragRef = useRef<Drag | null>(null);
    /** Set when a touch turned into a drag, so the click that follows doesn't zoom or close */
    const draggedRef = useRef(false);
    const closingRef = useRef(false);

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

    /** Moves the image (and dims the backdrop as it's pulled away vertically) without a React render per frame */
    const moveStage = useCallback((x: number, y: number, animate: boolean) => {
        const stage = stageRef.current;
        const backdrop = backdropRef.current;
        if (stage) {
            stage.style.transition = animate ? SETTLE : 'none';
            stage.style.transform = x || y ? `translate3d(${x}px, ${y}px, 0)` : '';
        }
        if (backdrop) {
            backdrop.style.transition = animate ? 'opacity 0.35s var(--ease-gallery)' : 'none';
            backdrop.style.opacity = String(1 - Math.min(Math.abs(y) / 400, 0.6));
        }
    }, []);

    const goTo = useCallback((index: number) => {
        setIsZoomed(false);
        if (index < 0) setCurrentIndex(images.length - 1);
        else if (index >= images.length) setCurrentIndex(0);
        else setCurrentIndex(index);
    }, [images.length]);

    const handleClose = useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;
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
        if (draggedRef.current) return;
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

    const handleTouchStart = (e: React.TouchEvent) => {
        draggedRef.current = false;
        if (isZoomed || closingRef.current || e.touches.length > 1) {
            dragRef.current = null;
            return;
        }
        // Pick the image up where it is, even halfway through settling back
        const stage = stageRef.current;
        const current = stage ? new DOMMatrixReadOnly(getComputedStyle(stage).transform) : null;
        const baseX = current?.m41 ?? 0;
        const baseY = current?.m42 ?? 0;
        const touch = e.touches[0];
        dragRef.current = {
            startX: touch.clientX,
            startY: touch.clientY,
            baseX,
            baseY,
            axis: baseX ? 'x' : baseY ? 'y' : null,
            x: baseX,
            y: baseY,
            lastX: touch.clientX,
            lastY: touch.clientY,
            lastTime: e.timeStamp,
            velocityX: 0,
            velocityY: 0,
        };
        moveStage(baseX, baseY, false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        if (e.touches.length > 1) {
            dragRef.current = null;
            moveStage(0, 0, true);
            return;
        }
        const touch = e.touches[0];
        const dx = touch.clientX - drag.startX;
        const dy = touch.clientY - drag.startY;
        if (!drag.axis) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_SLOP) return;
            drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
        draggedRef.current = true;

        const elapsed = Math.max(e.timeStamp - drag.lastTime, 1);
        drag.velocityX = (touch.clientX - drag.lastX) / elapsed;
        drag.velocityY = (touch.clientY - drag.lastY) / elapsed;
        drag.lastX = touch.clientX;
        drag.lastY = touch.clientY;
        drag.lastTime = e.timeStamp;

        if (drag.axis === 'x') {
            // A single image only gives a little, so the drag still feels connected
            drag.x = drag.baseX + (hasMultiple ? dx : dx * 0.25);
            drag.y = 0;
        } else {
            drag.x = 0;
            drag.y = drag.baseY + dy;
        }
        moveStage(drag.x, drag.y, false);
    };

    const handleTouchEnd = () => {
        const drag = dragRef.current;
        dragRef.current = null;
        if (!drag) return;

        if (drag.axis === 'x' && hasMultiple) {
            const flicked = Math.abs(drag.velocityX) > FLICK_SPEED && Math.sign(drag.velocityX) === Math.sign(drag.x);
            if (Math.abs(drag.x) > SWIPE_DISTANCE || flicked) {
                const step = drag.x < 0 ? 1 : -1;
                goTo(currentIndex + step);
                // The next image slides in from the side it was pulled from
                moveStage(step * Math.min(window.innerWidth * 0.3, 160), 0, false);
                requestAnimationFrame(() => requestAnimationFrame(() => moveStage(0, 0, true)));
                return;
            }
        }

        if (drag.axis === 'y') {
            const flicked = Math.abs(drag.velocityY) > FLICK_SPEED && Math.sign(drag.velocityY) === Math.sign(drag.y);
            if (Math.abs(drag.y) > DISMISS_DISTANCE || flicked) {
                const direction = Math.sign(drag.y) || 1;
                moveStage(0, direction * window.innerHeight * 0.6, true);
                handleClose();
                return;
            }
        }

        moveStage(0, 0, true);
    };

    // Click backdrop to close (but not on image)
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (draggedRef.current) return;
        if (e.target === containerRef.current || e.target === backdropRef.current) {
            handleClose();
        }
    };

    return createPortal(
        <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-9999 flex items-center justify-center overscroll-contain"
            onClick={handleBackdropClick}
            style={{
                opacity: isEntering ? 0 : 1,
                transition: 'opacity 0.25s ease',
                // Gestures are handled here; pinch still zooms the page for a closer look
                touchAction: 'pinch-zoom',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            <div
                ref={backdropRef}
                className="absolute inset-0 bg-black/92 backdrop-blur-sm"
            />

            {/* Close button */}
            <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                className={cn(CONTROL_CLASS, TOP, 'right-[max(1.25rem,env(safe-area-inset-right))]')}
                aria-label="Close lightbox"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            {/* Counter */}
            {hasMultiple && (
                <div
                    className={cn('absolute left-1/2 -translate-x-1/2 mt-1 text-xs tracking-[0.2em] uppercase tabular-nums font-body text-ink-faint', TOP)}
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
                        className={cn(CONTROL_CLASS, 'left-[max(1rem,env(safe-area-inset-left))] top-1/2 -translate-y-1/2')}
                        aria-label="Previous image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }}
                        className={cn(CONTROL_CLASS, 'right-[max(1rem,env(safe-area-inset-right))] top-1/2 -translate-y-1/2')}
                        aria-label="Next image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </>
            )}

            {/* Image */}
            <div
                ref={stageRef}
                className="relative flex items-center justify-center max-w-[90vw] max-h-[85vh]"
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

            {/* Dot indicators: a 2px bar inside a 24px-tall target */}
            {hasMultiple && (
                <div className={cn('absolute left-1/2 -translate-x-1/2 flex gap-1.5', BOTTOM)}>
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); goTo(i); }}
                            className={cn(
                                'relative w-8 h-6 p-0 cursor-pointer transition-opacity duration-300 before:absolute before:inset-x-0 before:top-1/2 before:h-0.5 before:-translate-y-1/2 before:bg-ink-muted',
                                i === currentIndex ? 'opacity-100' : 'opacity-30 hover:opacity-60',
                            )}
                            aria-label={`View image ${i + 1}`}
                            aria-current={i === currentIndex ? 'true' : undefined}
                        />
                    ))}
                </div>
            )}

            {/* Keyboard hints, only where there's a keyboard and room for them */}
            <p
                aria-hidden="true"
                className={cn(
                    'hidden lg:pointer-fine:flex absolute m-0 items-center gap-4 text-[0.65rem] tracking-[0.2em] uppercase font-body text-ink-faint',
                    BOTTOM,
                    'left-[max(1.25rem,env(safe-area-inset-left))]',
                )}
            >
                {hasMultiple && <span className="flex items-center gap-1.5"><Kbd>←</Kbd><Kbd>→</Kbd> Browse</span>}
                <span className="flex items-center gap-1.5"><Kbd>Esc</Kbd> Close</span>
            </p>
        </div>,
        document.body
    );
}
