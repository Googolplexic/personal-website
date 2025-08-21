import { useState, useEffect } from 'react';
import { ProjectProps } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ProjectLinks } from './ProjectLinks';
import { ProjectTechnologies } from './ProjectTechnologies';
import { HighlightedText } from '../ui/HighlightedText';
import { CategoryLabel } from '../ui/CategoryLabel';
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

    // Load first image if it's lazy
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
            className="cursor-pointer border-2 rounded-lg lg:p-12 p-6 mb-4 dark:border-gray-700 border-gray-400 hover:[box-shadow:0_0_15px_2px_rgba(0,0,0,0.2)] dark:hover:[box-shadow:0_0_15px_2px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] h-full flex flex-col"
        >
            {showCategory && categoryLabel && categoryColor && (
                <CategoryLabel label={categoryLabel} color={categoryColor} className="mb-3" />
            )}
            <div className="flex-1 flex flex-col justify-center">
                {firstImage && (
                    <div className="flex gap-2 mb-4 mx-auto justify-center">
                        <img
                            src={firstImage}
                            alt={`${props.title}`}
                            className="max-h-[12rem] w-auto h-auto object-contain rounded-lg"
                        />
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-2">
                    <HighlightedText text={props.title} searchTerm={searchTerm} />
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {props.startDate === props.endDate ? props.startDate : `${props.startDate} - ${props.endDate || 'Present'}`}
                </p>
                <p>
                    <HighlightedText text={props.summary} searchTerm={searchTerm} />
                </p>
                <ProjectTechnologies technologies={props.technologies} searchTerm={searchTerm} />
                <ProjectLinks project={props} />
            </div>
        </div>
    );
}