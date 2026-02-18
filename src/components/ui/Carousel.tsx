import { useState, useEffect } from 'react';
import { cn } from '../../utils/styles';
import { Lightbox } from './Lightbox';

interface CarouselProps {
    modelImages: string[];
    creasePattern?: string;
    priority?: boolean;
}

export function Carousel({ modelImages, creasePattern, priority = false }: CarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(
        // If priority, mark the first image as already loaded to skip JS preload
        () => priority && modelImages[0] ? new Set([modelImages[0]]) : new Set()
    );
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [lightboxCPOpen, setLightboxCPOpen] = useState(false);

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
        <div className="w-full">
            <div className={cn(
                'gap-4',
                creasePattern ? 'grid grid-cols-1 md:grid-cols-2' : 'grid grid-cols-1 max-w-2xl mx-auto'
            )}>
                <div className="relative group">
                    <div className={cn(
                        'h-72 mx-auto overflow-hidden flex items-center justify-center bg-transparent',
                        modelImages.length > 1 ? 'max-w-[90%]' : 'max-w-full'
                    )}>
                        <div
                            className="flex h-full transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                        >
                            {modelImages.map((img, i) => (
                                <div key={i} className="w-full flex-shrink-0 flex items-center justify-center">
                                    <img
                                        src={img}
                                        alt={`Model View ${i + 1}`}
                                        className="max-h-72 w-auto object-contain cursor-pointer"
                                        onClick={() => setLightboxIndex(i)}
                                        loading={priority && i === 0 ? 'eager' : 'lazy'}
                                        decoding={priority && i === 0 ? 'sync' : 'async'}
                                        fetchPriority={priority && i === 0 ? 'high' : undefined}
                                        width="640"
                                        height="288"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    {modelImages.length > 1 && (
                        <>
                            <button
                                onClick={() => changeImage(currentImageIndex === 0 ? modelImages.length - 1 : currentImageIndex - 1)}
                                className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-full"
                                style={{
                                    color: 'var(--color-text-primary)',
                                    background: 'rgba(10, 10, 10, 0.7)',
                                    backdropFilter: 'blur(12px) saturate(1.2)',
                                    WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)'
                                }}
                                aria-label="Previous image"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button
                                onClick={() => changeImage(currentImageIndex === modelImages.length - 1 ? 0 : currentImageIndex + 1)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-full"
                                style={{
                                    color: 'var(--color-text-primary)',
                                    background: 'rgba(10, 10, 10, 0.7)',
                                    backdropFilter: 'blur(12px) saturate(1.2)',
                                    WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)'
                                }}
                                aria-label="Next image"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                            <div className="flex justify-center gap-1 mt-3">
                                {modelImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => changeImage(index)}
                                        className={cn(
                                            'w-8 h-0.5 transition-all duration-300 border-none focus:outline-none p-0 cursor-pointer',
                                            index === currentImageIndex
                                                ? 'opacity-100'
                                                : 'opacity-30 hover:opacity-60'
                                        )}
                                        style={{ backgroundColor: 'var(--color-text-secondary)' }}
                                        aria-label={`View image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {creasePattern && (
                    <div className="max-w-[100%] h-72 mx-auto flex items-center justify-center bg-transparent">
                        <img
                            src={creasePattern}
                            alt="Crease Pattern"
                            className="max-h-72 w-auto object-contain cursor-pointer"
                            onClick={() => setLightboxCPOpen(true)}
                            loading="lazy"
                            width="640"
                            height="288"
                        />
                    </div>
                )}
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    images={modelImages}
                    initialIndex={lightboxIndex}
                    alt="Origami Model"
                    onClose={() => setLightboxIndex(null)}
                />
            )}

            {lightboxCPOpen && creasePattern && (
                <Lightbox
                    images={[creasePattern]}
                    initialIndex={0}
                    alt="Crease Pattern"
                    onClose={() => setLightboxCPOpen(false)}
                />
            )}
        </div>
    );
}
