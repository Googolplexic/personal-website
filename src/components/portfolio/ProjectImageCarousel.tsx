import { useState } from 'react';
import { useImagePreloader } from '../../utils/useImagePreloader';
import { cn } from '../../utils/styles';
import { Lightbox } from '../ui/Lightbox';
import { sizeForImage } from '../../utils/imageSize';

// Hidden until the carousel is hovered on mouse devices; always shown on touch, where there is no hover
const ARROW_CLASS = 'absolute top-1/2 -translate-y-1/2 w-11 h-11 p-0 flex items-center justify-center cursor-pointer border border-solid border-line-strong bg-canvas/70 backdrop-blur-md text-ink transition-all duration-300 hover:border-gold hover:text-gold [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100';

interface ProjectImageCarouselProps {
    images: string[];
    imagesFull?: string[];
    title: string;
}

export function ProjectImageCarousel({ images: resolvedImages, imagesFull, title }: ProjectImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useImagePreloader(resolvedImages);

    const changeImage = (newIndex: number) => setCurrentImageIndex(newIndex);

    if (resolvedImages.length === 0) {
        return <div className="text-center py-8">
            <h2 className="gallery-heading text-2xl text-ink-muted">No images :(</h2>
        </div>;
    }

    // The frame takes the shape of the photo on show, so a landscape shot isn't
    // letterboxed to the height of the tallest portrait in the set
    const activeSize = sizeForImage(resolvedImages[currentImageIndex]);
    const frameStyle = activeSize && {
        aspectRatio: `${activeSize.width} / ${activeSize.height}`,
        maxHeight: `min(65svh, 32rem, ${activeSize.height}px)`,
    };

    return (
        <div className="relative group">
            {/* Main image display */}
            <div className="relative overflow-hidden bg-canvas max-h-[min(65svh,32rem)] transition-[aspect-ratio] duration-500" style={frameStyle || undefined}>
                <div
                    className={cn('flex transition-transform duration-500 ease-in-out', frameStyle && 'h-full')}
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                    {resolvedImages.map((img, i) => {
                        const size = sizeForImage(img);
                        return (
                            <div key={i} className={cn('w-full shrink-0 flex justify-center items-center', frameStyle && 'h-full')}>
                                {/* A definite width lets the browser reserve the image's height before it loads */}
                                <img
                                    src={img}
                                    alt={`${title} - Image ${i + 1}`}
                                    title={`${title} - Image ${i + 1}${resolvedImages.length > 1 ? ` of ${resolvedImages.length}` : ''}`}
                                    className={cn('w-full object-contain cursor-zoom-in', frameStyle ? 'max-h-full' : 'max-h-[min(65svh,32rem)]')}
                                    style={size && { maxWidth: size.width }}
                                    onClick={() => setLightboxIndex(i)}
                                    loading={i <= 1 ? 'eager' : 'lazy'}
                                    width={size?.width}
                                    height={size?.height}
                                />
                            </div>
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
                    images={imagesFull && imagesFull.length === resolvedImages.length ? imagesFull : resolvedImages}
                    initialIndex={lightboxIndex}
                    alt={title}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    );
}
