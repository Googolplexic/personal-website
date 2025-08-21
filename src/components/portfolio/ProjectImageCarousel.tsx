import { useState, useEffect } from 'react';
import { useImagePreloader } from '../../utils/useImagePreloader';
import type { LazyImageCollection } from '../../utils/lazyImages';
import { loadImage, getResolvedImages } from '../../utils/lazyImages';

interface ProjectImageCarouselProps {
    images: string[] | LazyImageCollection;
    title: string;
}

export function ProjectImageCarousel({ images, title }: ProjectImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [resolvedImages, setResolvedImages] = useState<string[]>([]);
    const [isLazyCollection, setIsLazyCollection] = useState(false);

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

            // Preload next image
            const nextIndex = newIndex + 1;
            if (nextIndex < collection.loaders.length && !collection.resolved[nextIndex]) {
                loadImage(collection, nextIndex).then(() => {
                    setResolvedImages(getResolvedImages(collection));
                });
            }

            // Preload previous image
            const prevIndex = newIndex - 1;
            if (prevIndex >= 0 && !collection.resolved[prevIndex]) {
                loadImage(collection, prevIndex).then(() => {
                    setResolvedImages(getResolvedImages(collection));
                });
            }
        }
    };

    if (resolvedImages.length === 0) {
        return <div>
            <h2 className='text-gray-600 dark:text-gray-500'>No images :(</h2>
        </div>;
    }

    const currentImage = resolvedImages[currentImageIndex];

    return (
        <div className="relative mb-8 group z-0">
            <div className="max-w-[80%] h-48 mx-auto mb-4 rounded-lg flex align-middle">
                {currentImage && (
                    <img
                        src={currentImage}
                        alt={`${title} - Image ${currentImageIndex + 1}`}
                        title={`${title} - Image ${currentImageIndex + 1}${resolvedImages.length > 1 ? ` of ${resolvedImages.length}` : ''}`}
                        className="mx-auto max-h-48 object-contain rounded-lg my-auto cursor-pointer"
                        onClick={() => window.open(currentImage, '_blank')}
                        loading="eager"
                        width="640"
                        height="192"
                    />
                )}
            </div>
            {resolvedImages.length > 1 && (
                <>
                    <button
                        onClick={() => changeImage(currentImageIndex === 0 ? resolvedImages.length - 1 : currentImageIndex - 1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white p-2 rounded-r opacity-0 group-hover:opacity-100 transition-all border-none focus:outline-none"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => changeImage(currentImageIndex === resolvedImages.length - 1 ? 0 : currentImageIndex + 1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white p-2 rounded-l opacity-0 group-hover:opacity-100 transition-all border-none focus:outline-none"
                    >
                        →
                    </button>
                    <div>
                        {resolvedImages.map((_, index) => (
                            <button
                                key={index}
                                title={`View image ${index + 1}`}
                                aria-label={`View image ${index + 1}`}
                                onClick={() => changeImage(index)}
                                className={`w-12 h-1 p-2 mx-1 rounded-full transition-colors border-none focus:outline-none ${index === currentImageIndex
                                    ? 'bg-gray-600 dark:bg-gray-300'
                                    : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
