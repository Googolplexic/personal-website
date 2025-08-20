import { Carousel } from '../ui/Carousel';
import { HighlightedText } from '../ui/HighlightedText';
import { CategoryLabel } from '../ui/CategoryLabel';

interface OrigamiCardProps {
    title: string;
    description?: string;
    modelImages: string[];
    creasePattern?: string;
    date?: string;
    designer?: string;
    searchTerm?: string;
    categoryLabel?: string;
    categoryColor?: string;
    showCategory?: boolean;
}

export function OrigamiCard({ title, description, modelImages, creasePattern, date, designer, searchTerm = '', categoryLabel, categoryColor, showCategory = false }: OrigamiCardProps) {
    return (
        <div className="border-2 rounded-lg p-6 mb-8 dark:border-gray-700 border-gray-400 transition-all h-full flex flex-col">
            {showCategory && categoryLabel && categoryColor && (
                <CategoryLabel label={categoryLabel} color={categoryColor} className="mb-4" />
            )}
            <div className="flex-1 flex flex-col justify-center">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold">
                        <HighlightedText text={title} searchTerm={searchTerm} />
                    </h3>
                    {designer && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Designed by <HighlightedText text={designer} searchTerm={searchTerm} />
                        </p>
                    )}
                    {date && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {date}
                        </p>
                    )}
                    {description && (
                        <p>
                            <HighlightedText text={description} searchTerm={searchTerm} />
                        </p>
                    )}
                </div>
                <Carousel
                    modelImages={modelImages}
                    creasePattern={creasePattern}
                />
            </div>
        </div>
    );
}
