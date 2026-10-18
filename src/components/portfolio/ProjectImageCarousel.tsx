import { useMemo, useState } from 'react';
import type { ImageSet } from '../../types';
import { cn } from '../../utils/styles';
import { Lightbox, type LightboxImage } from '../ui/Lightbox';

// The carousel spans the main column: about two thirds of the 90rem page on desktop, full width below
const CAROUSEL_SIZES = '(min-width: 1440px) 960px, (min-width: 1024px) 66vw, 100vw';

// Hidden until the carousel is hovered on mouse devices; always shown on touch, where there is no hover
const ARROW_CLASS = 'absolute top-1/2 -translate-y-1/2 w-11 h-11 p-0 flex items-center justify-center cursor-pointer border border-solid border-line-strong bg-canvas/70 backdrop-blur-md text-ink transition-all duration-300 hover:border-gold hover:text-gold [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100';

interface ProjectImageCarouselProps {
    images: string[];
    imagesFull?: string[];
    imageSets?: Record<string, ImageSet>;
    title: string;
}

export function ProjectImageCarousel({ images: resolvedImages, imagesFull, imageSets, title }: ProjectImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const lightboxImages = useMemo(() => resolvedImages.map((img, i): LightboxImage => {
        const set = imageSets?.[img];
        const full = imagesFull?.length === resolvedImages.length ? imagesFull[i] : undefined;
        return {
            src: set?.large ?? full ?? img,
            width: set?.width,
            height: set?.height,
            preview: { src: img, srcSet: set?.srcSet, sizes: set && CAROUSEL_SIZES },
        };
    }), [resolvedImages, imagesFull, imageSets]);

    const changeImage = (newIndex: number) => setCurrentImageIndex(newIndex);

    if (resolvedImages.length === 0) {
        return <div className="text-center py-8">
            <h2 className="gallery-heading text-2xl text-ink-muted">No images :(</h2>
        </div>;
    }

    // One slot for every slide, sized to the tallest photo, so the text below
    // stays put when the pictures have different heights
    const tallest = resolvedImages.reduce<ImageSet | undefined>((best, img) => {
        const set = imageSets?.[img];
        if (!set) return best;
        if (!best || set.height / set.width > best.height / best.width) return set;
        return best;
    }, undefined);
    const frameStyle = tallest && {
        aspectRatio: `${tallest.width} / ${tallest.height}`,
        maxHeight: 'min(70svh, 44rem)',
    };

    return (
        <div className="relative group">
            {/* Main image display */}
            {/* mx-auto: the height cap shrinks a tall photo's frame, which would otherwise sit on the left */}
            <div className="relative mx-auto overflow-hidden bg-canvas max-h-[min(70svh,44rem)]" style={frameStyle || undefined}>
                <div
                    className={cn('flex transition-transform duration-500 ease-in-out', frameStyle && 'h-full')}
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                    {resolvedImages.map((img, i) => {
                        const set = imageSets?.[img];
                        // The slide on show and the ones either side, so an arrow press finds the image ready
                        const distance = Math.abs(i - currentImageIndex);
                        const nearby = Math.min(distance, resolvedImages.length - distance) <= 1;
                        return (
                            <button
                                key={i}
                                type="button"
                                aria-haspopup="dialog"
                                inert={i !== currentImageIndex}
                                onClick={() => setLightboxIndex(i)}
                                className={cn('w-full shrink-0 flex justify-center items-center p-0 bg-transparent cursor-zoom-in', frameStyle && 'h-full')}
                            >
                                {/* A definite width lets the browser reserve the image's height before it loads */}
                                <img
                                    src={img}
                                    srcSet={set?.srcSet}
                                    sizes={set && CAROUSEL_SIZES}
                                    alt={`${title} - Image ${i + 1}`}
                                    title={`${title} - Image ${i + 1}${resolvedImages.length > 1 ? ` of ${resolvedImages.length}` : ''}`}
                                    data-fade
                                    className={cn('w-full object-contain', frameStyle ? 'max-h-full' : 'max-h-[min(70svh,44rem)]')}
                                    style={set && { maxWidth: set.width }}
                                    loading={nearby ? 'eager' : 'lazy'}
                                    fetchPriority={i === 0 ? 'high' : undefined}
                                    width={set?.width}
                                    height={set?.height}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
            {resolvedImages.length > 1 && (
                <>
                    {/* Carousel arrows */}
                    <button
                        onClick={() => changeImage(currentImageIndex === 0 ? resolvedImages.length - 1 : currentImageIndex - 1)}
                        className={cn(ARROW_CLASS, 'left-3')}
                        aria-label="Previous image"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                        onClick={() => changeImage(currentImageIndex === resolvedImages.length - 1 ? 0 : currentImageIndex + 1)}
                        className={cn(ARROW_CLASS, 'right-3')}
                        aria-label="Next image"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                    {/* Dot indicators */}
                    <div className="flex justify-center gap-1.5 mt-4">
                        {resolvedImages.map((_, index) => (
                            <button
                                key={index}
                                title={`View image ${index + 1}`}
                                aria-label={`View image ${index + 1}`}
                                onClick={() => changeImage(index)}
                                className={cn(
                                    'w-10 h-0.5 bg-ink-muted transition-all duration-300 border-none focus:outline-hidden p-0 cursor-pointer',
                                    index === currentImageIndex
                                        ? 'opacity-100'
                                        : 'opacity-30 hover:opacity-60'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}

            {lightboxIndex !== null && (
                <Lightbox
                    images={lightboxImages}
                    initialIndex={lightboxIndex}
                    alt={title}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    );
}
