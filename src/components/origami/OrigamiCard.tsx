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
    priority?: boolean;
}

export function OrigamiCard({ title, description, modelImages, creasePattern, date, designer, searchTerm = '', categoryLabel, categoryColor, showCategory = false, priority = false }: OrigamiCardProps) {
    return (
        <div className="spotlight-item flex flex-col break-inside-avoid group">
            {/* Image first — like project cards */}
            <div className="mb-3">
                <Carousel
                    modelImages={modelImages}
                    creasePattern={creasePattern}
                    priority={priority}
                />
            </div>

            {/* Content below image */}
            <div className="pt-2 pb-4 flex-1 flex flex-col">
                {showCategory && categoryLabel && categoryColor && (
                    <CategoryLabel label={categoryLabel} color={categoryColor} className="mb-2" />
                )}

                <h3 className="gallery-heading text-lg md:text-xl mb-1 transition-colors duration-300 group-hover:!text-[var(--color-accent-text)]"
                    style={{ color: 'var(--color-text-primary)' }}>
                    <HighlightedText text={title} searchTerm={searchTerm} />
                </h3>
                {designer && (
                    <p className="text-xs tracking-wide mb-1 font-body"
                       style={{ color: 'var(--color-text-secondary)' }}>
                        <HighlightedText text={designer} searchTerm={searchTerm} />
                    </p>
                )}
                {date && (
                    <p className="text-xs tracking-[0.2em] uppercase mb-2 font-body"
                       style={{ color: 'var(--color-text-secondary)' }}>
                        {date}
                    </p>
                )}
                {description && (
                    <p className="text-sm leading-relaxed font-body"
                       style={{ color: 'var(--color-text-secondary)' }}>
                        <HighlightedText text={description} searchTerm={searchTerm} />
                    </p>
                )}
            </div>
        </div>
    );
}
