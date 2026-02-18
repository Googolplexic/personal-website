import { useState, useEffect } from 'react';
import { useImagePreloader } from '../../utils/useImagePreloader';
import type { LazyImageCollection } from '../../utils/lazyImages';
import { loadImage, getResolvedImages } from '../../utils/lazyImages';
import { cn } from '../../utils/styles';
import { Lightbox } from '../ui/Lightbox';

interface ProjectImageCarouselProps {
    images: string[] | LazyImageCollection;
    imagesFull?: string[];
    title: string;
}

export function ProjectImageCarousel({ images, imagesFull, title }: ProjectImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [resolvedImages, setResolvedImages] = useState<string[]>([]);
    const [isLazyCollection, setIsLazyCollection] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Check if images is a lazy collection
    useEffect(() => {
        if (images && typeof images === 'object' && 'loaders' in images) {
            setIsLazyCollection(true);
            setResolvedImages(getResolvedImages(images as LazyImageCollection));
        } else {
            setIsLazyCollection(false);
            setResolvedImages(images as string[] || []);
        }
    }, [images]);

    // Load current image if it's lazy and not yet loaded
    useEffect(() => {
        if (isLazyCollection && images && 'loaders' in images) {
            const collection = images as LazyImageCollection;
            if (currentImageIndex < collection.loaders.length && !collection.resolved[currentImageIndex]) {
                loadImage(collection, currentImageIndex).then(() => {
                    setResolvedImages(getResolvedImages(collection));
                });
            }
        }
    }, [currentImageIndex, isLazyCollection, images]);

    // Preload regular images
    useImagePreloader(isLazyCollection ? [] : resolvedImages);

    const changeImage = (newIndex: number) => {
        setCurrentImageIndex(newIndex);

        // Preload next and previous images if lazy
        if (isLazyCollection && images && 'loaders' in images) {
            const collection = images as LazyImageCollection;

            const nextIndex = newIndex + 1;
            if (nextIndex < collection.loaders.length && !collection.resolved[nextIndex]) {
                loadImage(collection, nextIndex).then(() => {
                    setResolvedImages(getResolvedImages(collection));
                });
            }

            const prevIndex = newIndex - 1;
            if (prevIndex >= 0 && !collection.resolved[prevIndex]) {
                loadImage(collection, prevIndex).then(() => {
                    setResolvedImages(getResolvedImages(collection));
                });
            }
        }
    };

    if (resolvedImages.length === 0) {
        return <div className="text-center py-8">
            <h2 className="gallery-heading text-2xl" style={{ color: 'var(--color-text-secondary)' }}>No images :(</h2>
        </div>;
    }

    return (
        <div className="relative group">
            {/* Main image display */}
            <div className="relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                    {resolvedImages.map((img, i) => (
                        <div key={i} className="w-full flex-shrink-0 flex justify-center items-center">
                            <img
                                src={img}
                                alt={`${title} - Image ${i + 1}`}
                                title={`${title} - Image ${i + 1}${resolvedImages.length > 1 ? ` of ${resolvedImages.length}` : ''}`}
                                className="max-h-[24rem] w-auto object-contain cursor-pointer"
                                onClick={() => setLightboxIndex(i)}
                                loading={i <= 1 ? 'eager' : 'lazy'}
                                width="640"
                                height="384"
                            />
                        </div>
                    ))}
                </div>
            </div>
            {resolvedImages.length > 1 && (
                <>
                    {/* Carousel arrows */}
                    <button
                        onClick={() => changeImage(currentImageIndex === 0 ? resolvedImages.length - 1 : currentImageIndex - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-full"
                        style={{
                            color: 'var(--color-text-primary)',
                            background: 'rgba(10, 10, 10, 0.7)',
                            backdropFilter: 'blur(12px) saturate(1.2)',
                            WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                            border: '1px solid rgba(255, 255, 255, 0.15)'
                        }}
                        aria-label="Previous image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                        onClick={() => changeImage(currentImageIndex === resolvedImages.length - 1 ? 0 : currentImageIndex + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-full"
                        style={{
                            color: 'var(--color-text-primary)',
                            background: 'rgba(10, 10, 10, 0.7)',
                            backdropFilter: 'blur(12px) saturate(1.2)',
                            WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                            border: '1px solid rgba(255, 255, 255, 0.15)'
                        }}
                        aria-label="Next image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
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
                                    'w-10 h-0.5 transition-all duration-300 border-none focus:outline-none p-0 cursor-pointer',
                                    index === currentImageIndex
                                        ? 'opacity-100'
                                        : 'opacity-30 hover:opacity-60'
                                )}
                                style={{ backgroundColor: 'var(--color-text-secondary)' }}
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
