import { Carousel } from '../ui/Carousel';
import { HighlightedText } from '../ui/HighlightedText';
import { CategoryLabel } from '../ui/CategoryLabel';
import { Card, Heading, Text } from '../ui/base';

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
        <Card padding="md" className="mb-8 h-full flex flex-col">
            {showCategory && categoryLabel && categoryColor && (
                <CategoryLabel label={categoryLabel} color={categoryColor} className="mb-4" />
            )}
            <div className="flex-1 flex flex-col justify-center">
                <div className="mb-6">
                    <Heading level={3} className="mb-2">
                        <HighlightedText text={title} searchTerm={searchTerm} />
                    </Heading>
                    {designer && (
                        <Text size="sm" color="secondary" className="mb-2">
                            Designed by <HighlightedText text={designer} searchTerm={searchTerm} />
                        </Text>
                    )}
                    {date && (
                        <Text size="sm" color="secondary" className="mb-2">
                            {date}
                        </Text>
                    )}
                    {description && (
                        <Text>
                            <HighlightedText text={description} searchTerm={searchTerm} />
                        </Text>
                    )}
                </div>
                <Carousel
                    modelImages={modelImages}
                    creasePattern={creasePattern}
                />
            </div>
        </Card>
    );
}
