import { Carousel } from './Carousel';

interface OrigamiModelProps {
    title: string;
    description?: string;
    modelImages: string[];
    creasePattern?: string;
    date?: string;
}

export function OrigamiModel({ title, description, modelImages, creasePattern, date }: OrigamiModelProps) {
    return (
        <div className="w-full mb-12">
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                {description && (
                    <p className="text-gray-600 dark:text-gray-400">{description}</p>
                )}
                {date && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(date).toLocaleDateString('en-US', { 
                            year: 'numeric',
                            month: 'long'
                        })}
                    </p>
                )}
            </div>
            <Carousel
                modelImages={modelImages}
                creasePattern={creasePattern}
            />
        </div>
    );
}
