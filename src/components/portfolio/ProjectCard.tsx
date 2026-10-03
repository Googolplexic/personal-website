import { useState, useEffect } from 'react';
import { ProjectProps } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { HighlightedText } from '../ui/HighlightedText';
import { CategoryLabel } from '../ui/CategoryLabel';
import type { LazyImageCollection } from '../../utils/lazyImages';
import { loadImage } from '../../utils/lazyImages';
import { ShareButton } from '../ui/ShareButton';
import { sizeForImage } from '../../utils/imageSize';

const BASE_URL = 'https://www.colemanlai.com';

function resolveFirstImageSync(images: ProjectProps['images']): string {
    if (!images) return '';
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'object' && 'loaders' in images) {
        const collection = images as LazyImageCollection;
        if (collection.resolved[0]) return collection.resolved[0];
    }
    return '';
}

interface ProjectWithBasePath extends ProjectProps {
    basePath?: string;
    searchTerm?: string;
    categoryLabel?: string;
    categoryColor?: string;
    showCategory?: boolean;
    priority?: boolean;
    imageAlreadyShown?: boolean;
}

export function ProjectCard({ basePath = '/portfolio', searchTerm = '', categoryLabel, categoryColor, showCategory = false, priority = false, imageAlreadyShown = false, ...props }: ProjectWithBasePath) {
    const navigate = useNavigate();
    const location = useLocation();
    const [firstImage, setFirstImage] = useState<string>(() => resolveFirstImageSync(props.images));

    const queryString = location.search || (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '');
    const projectPath = `${basePath}/${props.slug}${queryString}`;
    const shareUrl = `${BASE_URL}/portfolio/${props.slug}`;

    useEffect(() => {
        if (firstImage) return;
        if (props.images && typeof props.images === 'object' && 'loaders' in props.images) {
            const collection = props.images as LazyImageCollection;
            if (collection.loaders.length > 0 && !collection.resolved[0]) {
                loadImage(collection, 0).then(url => setFirstImage(url));
            }
        }
    }, [props.images, firstImage]);

    useEffect(() => {
        if (!imageAlreadyShown) return;
        const card = document.getElementById('boot-portfolio-card');
        if (!card) return;
        const onClick = (event: Event) => {
            event.preventDefault();
            navigate(projectPath, { state: { from: location.pathname } });
            window.scrollTo(0, 0);
        };
        card.addEventListener('click', onClick);
        return () => card.removeEventListener('click', onClick);
    }, [imageAlreadyShown, navigate, projectPath, location.pathname]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate(projectPath, { state: { from: location.pathname } });
        window.scrollTo(0, 0);
    };

    const cardBody = (
            <>
            {/* Image — no rounding, raw edge */}
            {!imageAlreadyShown && firstImage && (
                <div className="w-full overflow-hidden flex justify-center">
                    <img
                        src={firstImage}
                        alt={props.title}
                        className="block w-full h-auto"
                        loading={priority ? 'eager' : 'lazy'}
                        decoding={priority ? 'sync' : 'async'}
                        width={sizeForImage(firstImage)?.width}
                        height={sizeForImage(firstImage)?.height}
                    />
                </div>
            )}

            {/* Content — minimal, below the image */}
            <div className="pt-4 pb-6 flex-1 flex flex-col">
                {showCategory && categoryLabel && categoryColor && (
                    <CategoryLabel label={categoryLabel} color={categoryColor} className="mb-2" />
                )}

                <h3 className="gallery-heading text-lg md:text-xl mb-1 transition-colors duration-300 group-hover:!text-[var(--color-accent-text)]"
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
                    <ShareButton url={shareUrl} title={props.title} description={props.summary} />
                </div>
            </div>
            </>
    );

    if (imageAlreadyShown) return cardBody;

    return (
        <a
            href={projectPath}
            onClick={handleClick}
            className="spotlight-item flex flex-col cursor-pointer group break-inside-avoid"
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            {cardBody}
        </a>
    );
}