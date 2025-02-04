import { useState } from 'react';

interface CarouselProps {
    modelImages: string[];
    creasePattern?: string;
}

export function Carousel({ modelImages, creasePattern }: CarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const changeImage = (newIndex: number) => {
        setCurrentImageIndex(newIndex);
    };

    return (
        <div className="w-full group">
            <div className={`grid gap-4 ${creasePattern ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
                <div className="relative group">
                    <div className="max-w-[80%] h-72 mx-auto rounded-lg flex items-center justify-center bg-transparent">
                        <img
                            src={modelImages[currentImageIndex]}
                            alt={`Model View ${currentImageIndex + 1}`}
                            className="max-h-72 w-auto object-contain rounded-lg cursor-pointer"
                            onClick={() => window.open(modelImages[currentImageIndex], '_blank')}
                            loading="eager"
                            width="640"
                            height="288"
                        />
                    </div>
                    {modelImages.length > 1 && (
                        <>
                            <button
                                onClick={() => changeImage(currentImageIndex === 0 ? modelImages.length - 1 : currentImageIndex - 1)}
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white p-2 rounded-r opacity-0 group-hover:opacity-100 transition-all border-none focus:outline-none"
                            >
                                ←
                            </button>
                            <button
                                onClick={() => changeImage(currentImageIndex === modelImages.length - 1 ? 0 : currentImageIndex + 1)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white p-2 rounded-l opacity-0 group-hover:opacity-100 transition-all border-none focus:outline-none"
                            >
                                →
                            </button>
                            <div className="flex justify-center mt-2">
                                {modelImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => changeImage(index)}
                                        className={`w-12 h-1 mx-1 rounded-full transition-colors border-none focus:outline-none ${
                                            index === currentImageIndex
                                                ? 'bg-gray-600 dark:bg-gray-300'
                                                : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                                        }`}
                                        aria-label={`View image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                
                {creasePattern && (
                    <div className="max-w-[80%] h-72 mx-auto rounded-lg flex items-center justify-center bg-transparent">
                        <img
                            src={creasePattern}
                            alt="Crease Pattern"
                            className="max-h-72 w-auto object-contain rounded-lg cursor-pointer"
                            onClick={() => window.open(creasePattern, '_blank')}
                            loading="eager"
                            width="640"
                            height="288"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
