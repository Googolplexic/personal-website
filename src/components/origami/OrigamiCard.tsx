import { useNavigate } from 'react-router';
import { HighlightedText } from '../ui/HighlightedText';
import { CategoryLabel } from '../ui/CategoryLabel';
import { ShareButton } from '../ui/ShareButton';
import { sizeForImage } from '../../utils/imageSize';
import { BASE_URL } from '../../utils/seo';
import { useClientLocation } from '../../utils/useHydrated';

interface OrigamiCardProps {
    slug: string;
    title: string;
    description?: string;
    modelImages: string[];
    date?: string;
    designer?: string;
    searchTerm?: string;
    categoryLabel?: string;
    showCategory?: boolean;
    priority?: boolean;
}

export function OrigamiCard({ slug, title, description, modelImages, date, designer, searchTerm = '', categoryLabel, showCategory = false, priority = false }: OrigamiCardProps) {
    const navigate = useNavigate();
    const location = useClientLocation();
    const heroImage = modelImages[0];
    const shareUrl = `${BASE_URL}/origami/${slug}`;
    const queryString = location.search || (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '');
    const path = `/origami/${slug}${queryString}`;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate(path, { state: { from: location.pathname } });
        window.scrollTo(0, 0);
    };

    return (
        <a
            href={path}
            onClick={handleClick}
            className="spotlight-item flex flex-col cursor-pointer group break-inside-avoid"
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            {heroImage && (
                <div className="w-full overflow-hidden">
                    <img
                        src={heroImage}
                        alt={title}
                        className="block w-full h-auto"
                        loading={priority ? 'eager' : 'lazy'}
                        decoding={priority ? 'sync' : 'async'}
                        width={sizeForImage(heroImage)?.width}
                        height={sizeForImage(heroImage)?.height}
                    />
                </div>
            )}

            <div className="pt-4 pb-6 flex-1 flex flex-col">
                {showCategory && categoryLabel && (
                    <CategoryLabel label={categoryLabel} className="mb-2" />
                )}

                <h3 className="gallery-heading text-lg md:text-xl mb-1 transition-colors duration-300 group-hover:text-gold! text-ink">
                    <HighlightedText text={title} searchTerm={searchTerm} />
                </h3>
                {designer && (
                    <p className="text-xs tracking-wide mb-1 font-body text-ink-muted">
                        <HighlightedText text={designer} searchTerm={searchTerm} />
                    </p>
                )}
                {date && (
                    <p className="text-xs tracking-[0.2em] uppercase mb-2 font-body text-ink-muted">
                        {date}
                    </p>
                )}
                {description && (
                    <p className="text-sm leading-relaxed mb-4 font-body text-ink-muted">
                        <HighlightedText text={description} searchTerm={searchTerm} />
                    </p>
                )}

                <div className="mt-auto">
                    <ShareButton
                        url={shareUrl}
                        title={title}
                        description={description}
                    />
                </div>
            </div>
        </a>
    );
}
