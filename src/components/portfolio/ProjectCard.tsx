import { useState, useEffect } from 'react';
import { ProjectProps } from '../../types';
import { useNavigate } from 'react-router-dom';
import { HighlightedText } from '../ui/HighlightedText';
import { CategoryLabel } from '../ui/CategoryLabel';
import { LazyImage } from '../ui/LazyImage';
import type { LazyImageCollection } from '../../utils/lazyImages';
import { loadImage } from '../../utils/lazyImages';

interface ProjectWithBasePath extends ProjectProps {
    basePath?: string;
    searchTerm?: string;
    categoryLabel?: string;
    categoryColor?: string;
    showCategory?: boolean;
}

export function ProjectCard({ basePath = '/portfolio', searchTerm = '', categoryLabel, categoryColor, showCategory = false, ...props }: ProjectWithBasePath) {
    const navigate = useNavigate();
    const [firstImage, setFirstImage] = useState<string>('');

    const projectPath = `${basePath}/${props.slug}${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`;

    useEffect(() => {
        if (props.images) {
            if (typeof props.images === 'object' && 'loaders' in props.images) {
                const collection = props.images as LazyImageCollection;
                if (collection.loaders.length > 0) {
                    if (collection.resolved[0]) {
                        setFirstImage(collection.resolved[0]);
                    } else {
                        loadImage(collection, 0).then((url) => {
                            setFirstImage(url);
                        });
                    }
                }
            } else if (Array.isArray(props.images) && props.images.length > 0) {
                setFirstImage(props.images[0]);
            }
        }
    }, [props.images]);

    const handleClick = (e: React.MouseEvent) => {
        if (!(e.target as HTMLElement).closest('a')) {
            navigate(projectPath);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="spotlight-item flex flex-col cursor-pointer group break-inside-avoid"
        >
            {/* Image — no rounding, raw edge */}
            {firstImage && (
                <div className="relative overflow-hidden aspect-[16/10]">
                    <LazyImage
                        src={firstImage}
                        alt={props.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                </div>
            )}

            {/* Content — minimal, below the image */}
            <div className="pt-4 pb-6 flex-1 flex flex-col">
                {showCategory && categoryLabel && categoryColor && (
                    <CategoryLabel label={categoryLabel} color={categoryColor} className="mb-2" />
                )}

                <h3 className="gallery-heading text-lg md:text-xl mb-1"
                    style={{ color: 'var(--color-text-primary)' }}>
                    <HighlightedText text={props.title} searchTerm={searchTerm} />
                </h3>

                <p className="text-xs tracking-[0.2em] uppercase mb-3 font-body"
                   style={{ color: 'var(--color-text-secondary)' }}>
                    {props.startDate === props.endDate ? props.startDate : `${props.startDate} – ${props.endDate || 'Present'}`}
                </p>

                <p className="text-sm leading-relaxed mb-4 font-body"
                   style={{ color: 'var(--color-text-secondary)' }}>
                    <HighlightedText text={props.summary} searchTerm={searchTerm} />
                </p>

                <div className="mt-auto space-y-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-body" style={{ color: 'var(--color-text-secondary)' }}>
                        {props.technologies.map((tech, i) => (
                            <span key={i}>
                                <HighlightedText text={tech} searchTerm={searchTerm} />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}