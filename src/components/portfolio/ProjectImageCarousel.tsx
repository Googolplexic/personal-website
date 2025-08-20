import { useState } from 'react';
import { useImagePreloader } from '../../utils/useImagePreloader';

interface ProjectImageCarouselProps {
    images: string[];
    title: string;
}

export function ProjectImageCarousel({ images, title }: ProjectImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    useImagePreloader(images);

    const changeImage = (newIndex: number) => {
        setCurrentImageIndex(newIndex);
    };

    if (images.length === 0) {
        return <div>
            <h2 className='text-gray-600 dark:text-gray-500'>No images :(</h2>
        </div>;
    }

    return (
        <div className="relative mb-8 group z-0">
            <div className="max-w-[80%] h-48 mx-auto mb-4 rounded-lg flex align-middle">
                <img
                    src={images[currentImageIndex]}
                    alt={`${title} - Image ${currentImageIndex + 1}`}
                    title={`${title} - Image ${currentImageIndex + 1}${images.length > 1 ? ` of ${images.length}` : ''}`}
                    className="mx-auto max-h-48 object-contain rounded-lg my-auto cursor-pointer"
                    onClick={() => window.open(images[currentImageIndex], '_blank')}
                    loading="eager"
                    width="640"
                    height="192"
                />
            </div>
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => changeImage(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white p-2 rounded-r opacity-0 group-hover:opacity-100 transition-all border-none focus:outline-none"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => changeImage(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800 text-white p-2 rounded-l opacity-0 group-hover:opacity-100 transition-all border-none focus:outline-none"
                    >
                        →
                    </button>
                    <div>
                        {images.map((_, index) => (
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
