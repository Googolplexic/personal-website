import { useState, useEffect } from 'react';
import { Button, Flex } from './base';
import { cn } from '../../utils/styles';

interface CarouselProps {
    modelImages: string[];
    creasePattern?: string;
}

export function Carousel({ modelImages, creasePattern }: CarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    // Preload current image and next/previous images
    useEffect(() => {
        const imagesToLoad = [
            modelImages[currentImageIndex],
            modelImages[currentImageIndex + 1],
            modelImages[currentImageIndex - 1],
            creasePattern
        ].filter((img): img is string => img !== undefined);

        imagesToLoad.forEach(src => {
            if (!loadedImages.has(src)) {
                const img = new Image();
                img.onload = () => {
                    setLoadedImages(prev => new Set(prev).add(src));
                };
                img.src = src;
            }
        });
    }, [currentImageIndex, modelImages, creasePattern, loadedImages]);

    const changeImage = (newIndex: number) => {
        setCurrentImageIndex(newIndex);
    };

    return (
        <div className="w-full group">
            <div className={cn(
                'grid gap-4',
                creasePattern ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'
            )}>
                <div className="relative group">
                    <div className={cn(
                        'h-72 mx-auto rounded-lg flex items-center justify-center bg-transparent',
                        modelImages.length > 1 ? 'max-w-[90%]' : 'max-w-full'
                    )}>
                        <img
                            src={modelImages[currentImageIndex]}
                            alt={`Model View ${currentImageIndex + 1}`}
                            className="max-h-72 w-auto object-contain rounded-lg cursor-pointer"
                            onClick={() => window.open(modelImages[currentImageIndex], '_blank')}
                            loading="lazy"
                            width="640"
                            height="288"
                        />
                    </div>
                    {modelImages.length > 1 && (
                        <>
                            <Button
                                variant="icon"
                                onClick={() => changeImage(currentImageIndex === 0 ? modelImages.length - 1 : currentImageIndex - 1)}
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white rounded-r opacity-0 group-hover:opacity-100 transition-all"
                                aria-label="Previous image"
                            >
                                ←
                            </Button>
                            <Button
                                variant="icon"
                                onClick={() => changeImage(currentImageIndex === modelImages.length - 1 ? 0 : currentImageIndex + 1)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white rounded-l opacity-0 group-hover:opacity-100 transition-all"
                                aria-label="Next image"
                            >
                                →
                            </Button>
                            <Flex justify="center" gap="1" className="mt-2">
                                {modelImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => changeImage(index)}
                                        className={cn(
                                            'w-12 h-1 mx-1 rounded-full transition-colors border-none focus:outline-none p-0',
                                            index === currentImageIndex
                                                ? 'bg-gray-600 dark:bg-gray-300'
                                                : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                                        )}
                                        aria-label={`View image ${index + 1}`}
                                    />
                                ))}
                            </Flex>
                        </>
                    )}
                </div>

                {creasePattern && (
                    <div className="max-w-[100%] h-72 mx-auto rounded-lg flex items-center justify-center bg-transparent">
                        <img
                            src={creasePattern}
                            alt="Crease Pattern"
                            className="max-h-72 w-auto object-contain rounded-lg cursor-pointer"
                            onClick={() => window.open(creasePattern, '_blank')}
                            loading="lazy"
                            width="640"
                            height="288"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
