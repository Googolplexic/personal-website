import { Carousel } from './Carousel';

interface OrigamiModelProps {
    title: string;
    description?: string;
    modelImages: string[];
    creasePattern?: string;
    date?: string;
    designer?: string;
}

export function OrigamiModel({ title, description, modelImages, creasePattern, date, designer }: OrigamiModelProps) {
    return (
        <div className="border-2 rounded-lg lg:p-8 p-6 mb-8 dark:border-gray-700 border-gray-400 transition-all h-full">
            <div className="mb-6">
                <h3 className="text-2xl font-bold ">{title}</h3>
                {designer && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Designed by {designer}
                    </p>
                )}
                {date && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {date}
                    </p>
                )}
                {description && (
                    <p>{description}</p>
                )}
            </div>
            <Carousel
                modelImages={modelImages}
                creasePattern={creasePattern}
            />
        </div>
    );
}
