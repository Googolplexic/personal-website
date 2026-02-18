import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../utils/styles';
import { Lightbox } from './Lightbox';

interface CarouselProps {
    modelImages: string[];
    modelImagesFull?: string[];
    creasePattern?: string;
    creasePatternFull?: string;
    priority?: boolean;
}

export function Carousel({ modelImages, modelImagesFull, creasePattern, creasePatternFull, priority = false }: CarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0]));
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [lightboxCPOpen, setLightboxCPOpen] = useState(false);
    const [isNearViewport, setIsNearViewport] = useState(priority);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (priority || isNearViewport) return;
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsNearViewport(true);
                    observer.unobserve(el);
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => { observer.unobserve(el); };
    }, [priority, isNearViewport]);

    const changeImage = useCallback((newIndex: number) => {
        setCurrentImageIndex(newIndex);
        setLoadedSlides(prev => {
            const next = new Set(prev);
            next.add(newIndex);
            if (newIndex > 0) next.add(newIndex - 1);
            if (newIndex < modelImages.length - 1) next.add(newIndex + 1);
            return next;
        });
    }, [modelImages.length]);

    const lightboxImages = modelImagesFull && modelImagesFull.length > 0 ? modelImagesFull : modelImages;
    const lightboxCP = creasePatternFull || creasePattern;

    return (
        <div ref={containerRef} className="w-full">
            <div className={cn(
                'gap-4',
                creasePattern ? 'grid grid-cols-1 md:grid-cols-2' : 'grid grid-cols-1 max-w-2xl mx-auto'
            )}>
                <div className="relative group">
                    <div className={cn(
                        'h-72 mx-auto overflow-hidden bg-transparent',
                        modelImages.length > 1 ? 'max-w-[90%]' : 'max-w-full'
                    )}>
                        <div
                            className="flex h-full transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                        >
                            {modelImages.map((img, i) => (
                                <div key={i} className="w-full flex-shrink-0 flex items-center justify-center relative">
                                    {(isNearViewport && loadedSlides.has(i)) ? (
                                        <img
                                            src={img}
                                            alt={`Model View ${i + 1}`}
                                            className="h-full w-full object-contain cursor-pointer"
                                            onClick={() => setLightboxIndex(i)}
                                            loading={priority && i === 0 ? 'eager' : 'lazy'}
                                            decoding={priority && i === 0 ? 'sync' : 'async'}
                                            fetchPriority={priority && i === 0 ? 'high' : undefined}
                                        />
                                    ) : (
                                        <div className="h-full w-full" />
                                    )}
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
                    <div className="h-72 mx-auto flex items-center justify-center bg-transparent">
                        {isNearViewport ? (
                            <img
                                src={creasePattern}
                                alt="Crease Pattern"
                                className="h-full w-full object-contain cursor-pointer"
                                onClick={() => setLightboxCPOpen(true)}
                                loading="lazy"
                            />
                        ) : (
                            <div className="h-full w-full" />
                        )}
                    </div>
                )}
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    images={lightboxImages}
                    initialIndex={lightboxIndex}
                    alt="Origami Model"
                    onClose={() => setLightboxIndex(null)}
                />
            )}

            {lightboxCPOpen && lightboxCP && (
                <Lightbox
                    images={[lightboxCP]}
                    initialIndex={0}
                    alt="Crease Pattern"
                    onClose={() => setLightboxCPOpen(false)}
                />
            )}
        </div>
    );
}
