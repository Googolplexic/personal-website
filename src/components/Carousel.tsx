import { useState } from 'react';

interface CarouselProps {
    modelImages: string[];
    title: string;
    creasePattern?: string;
}

export function Carousel({ modelImages, title, creasePattern }: CarouselProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    const nextImage = () => {
        setSelectedImage((prev) => prev === modelImages.length - 1 ? 0 : prev + 1);
    };

    const prevImage = () => {
        setSelectedImage((prev) => prev === 0 ? modelImages.length - 1 : prev - 1);
    };

    return (
        <div className="w-full mb-8 group">
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <div className={`grid gap-4 ${creasePattern ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
                <div className="relative group">
                    <div className="max-w-[80%] h-48 mx-auto rounded-lg flex items-center justify-center bg-transparent">
                        <img
                            src={modelImages[selectedImage]}
                            alt={`${title} - Model View ${selectedImage + 1}`}
                            className="max-h-48 w-auto object-contain rounded-lg cursor-pointer"
                            onClick={() => window.open(modelImages[selectedImage], '_blank')}
                        />
                    </div>
                    
                    {modelImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white p-2 rounded-r opacity-0 group-hover:opacity-100 transition-all border-none focus:outline-none"
                            >
                                ←
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white p-2 rounded-l opacity-0 group-hover:opacity-100 transition-all border-none focus:outline-none"
                            >
                                →
                            </button>
                            <div className="flex justify-center mt-2">
                                {modelImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-12 h-1 mx-1 rounded-full transition-colors border-none focus:outline-none ${
                                            index === selectedImage
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
                    <div className="max-w-[80%] h-48 mx-auto rounded-lg flex items-center justify-center bg-transparent">
                        <img
                            src={creasePattern}
                            alt={`${title} - Crease Pattern`}
                            className="max-h-48 w-auto object-contain rounded-lg cursor-pointer"
                            onClick={() => window.open(creasePattern, '_blank')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
