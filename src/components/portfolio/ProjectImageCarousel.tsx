import { useMemo, useState } from 'react';
import type { ImageSet } from '../../types';
import { cn } from '../../utils/styles';
import { exhibitTransition, previewFor } from '../../utils/viewTransition';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
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
    /** The piece's slug; the slide on show pairs with its listing card in a View Transition */
    slug: string;
}

export function ProjectImageCarousel({ images: resolvedImages, imagesFull, imageSets, title, slug }: ProjectImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    // The listing card's image, when that's how the visitor got here; it is the first slide
    const [preview] = useState(() => previewFor(slug));

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

    // One height for every slide, so the text below stays put. As tall as the widest
    // photo at the column width, and no taller than that photo or the cap. The width
    // stays the column, so a portrait fits that height and sits narrower.
    const widest = resolvedImages.reduce<ImageSet | undefined>((best, img) => {
        const set = imageSets?.[img];
        if (!set) return best;
        if (!best || set.width / set.height > best.width / best.height) return set;
        return best;
    }, undefined);
    const frameStyle = {
        height: widest
            ? `min(70svh, 44rem, ${widest.height}px, calc(100cqw * ${widest.height} / ${widest.width}))`
            : 'min(70svh, 44rem)',
    };

    return (
        <div className="@container relative group">
            {/* The name sits on this frame, not a slide. The strip is translated, and a transformed ancestor makes Safari and Firefox ignore view-transition-name. */}
            <div className="relative w-full overflow-hidden bg-canvas vt-exhibit" style={{ ...frameStyle, ...exhibitTransition(slug) }}>
                <div
                    className="flex h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                    {resolvedImages.map((img, i) => {
                        const set = imageSets?.[img];
                        // The slide on show and the ones either side, so an arrow press finds the image ready
                        const distance = Math.abs(i - currentImageIndex);
                        const nearby = Math.min(distance, resolvedImages.length - distance) <= 1;
                        const fitStyle = set ? {
                            maxWidth: `min(100%, ${set.width}px)`,
                            maxHeight: `min(100%, ${set.height}px)`,
                        } : undefined;
                        return (
                            <button
                                key={i}
                                type="button"
                                aria-haspopup="dialog"
                                inert={i !== currentImageIndex}
                                onClick={() => setLightboxIndex(i)}
                                className="relative w-full h-full shrink-0 min-w-0 p-0 bg-transparent cursor-zoom-in"
                            >
                                <ImagePlaceholder
                                    set={set}
                                    preview={i === 0 ? preview : undefined}
                                    fit="contain"
                                    className="m-auto w-full h-full"
                                    style={fitStyle}
                                />
                                {/* A definite width lets the browser reserve the image's height before it loads */}
                                <img
                                    src={img}
                                    srcSet={set?.srcSet}
                                    sizes={set && CAROUSEL_SIZES}
                                    alt={`${title} - Image ${i + 1}`}
                                    title={`${title} - Image ${i + 1}${resolvedImages.length > 1 ? ` of ${resolvedImages.length}` : ''}`}
                                    data-fade
                                    className="absolute inset-0 m-auto w-full h-full object-contain"
                                    style={fitStyle}
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
                    <div className="flex justify-center gap-1.5 mt-1">
                        {resolvedImages.map((_, index) => (
                            <button
                                key={index}
                                title={`View image ${index + 1}`}
                                aria-label={`View image ${index + 1}`}
                                onClick={() => changeImage(index)}
                                className={cn(
                                    // A 2px bar inside a 24px-tall target
                                    'relative w-10 h-6 p-0 transition-all duration-300 border-none focus:outline-hidden cursor-pointer before:absolute before:inset-x-0 before:top-1/2 before:h-0.5 before:-translate-y-1/2 before:bg-ink-muted',
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
