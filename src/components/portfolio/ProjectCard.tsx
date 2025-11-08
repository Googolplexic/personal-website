import { useState, useEffect } from 'react';
import { ProjectProps } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ProjectLinks } from './ProjectLinks';
import { ProjectTechnologies } from './ProjectTechnologies';
import { HighlightedText } from '../ui/HighlightedText';
import { CategoryLabel } from '../ui/CategoryLabel';
import { Card, Heading, Text } from '../ui/base';
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
        <Card
            onClick={handleClick}
            variant="interactive"
            padding="lg"
            className="mb-4 h-full flex flex-col"
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
                <Heading level={2} className="mb-2">
                    <HighlightedText text={props.title} searchTerm={searchTerm} />
                </Heading>
                <Text size="sm" color="secondary" className="mb-2">
                    {props.startDate === props.endDate ? props.startDate : `${props.startDate} - ${props.endDate || 'Present'}`}
                </Text>
                <Text>
                    <HighlightedText text={props.summary} searchTerm={searchTerm} />
                </Text>
                <ProjectTechnologies technologies={props.technologies} searchTerm={searchTerm} />
                <ProjectLinks project={props} />
            </div>
        </Card>
    );
}