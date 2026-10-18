import { Link } from 'react-router';
import type { ItemProps } from '../../types';
import { sizeForImage } from '../../utils/imageSize';
import { BASE_URL } from '../../utils/seo';
import { cn } from '../../utils/styles';
import { useClientLocation } from '../../utils/useHydrated';
import { HighlightedText } from './HighlightedText';
import { Placard } from './Placard';
import { ShareButton } from './ShareButton';

interface ExhibitCardProps {
    item: ItemProps;
    searchTerm?: string;
    /** Collection name added to the exhibit line in mixed listings */
    categoryLabel?: string;
    priority?: boolean;
    className?: string;
}

function cardDetails(item: ItemProps) {
    switch (item.type) {
        case 'project':
            return {
                path: `/portfolio/${item.slug}`,
                image: item.images?.[0],
                text: item.summary,
                medium: item.technologies,
                date: item.startDate === item.endDate ? item.startDate : `${item.startDate} – ${item.endDate || 'Present'}`,
            };
        case 'origami':
            return {
                path: `/origami/${item.slug}`,
                image: item.modelImages[0],
                text: item.description,
                medium: item.designer ? [item.designer] : [],
                date: item.date,
            };
        default: {
            const unhandled: never = item;
            return unhandled;
        }
    }
}

/**
 * ExhibitCard - a work in a listing: image, placard, and the short text.
 * The title link stretches over the whole card, so the Share button can sit
 * inside it without nesting interactive elements.
 */
export function ExhibitCard({ item, searchTerm = '', categoryLabel, priority = false, className }: ExhibitCardProps) {
    const location = useClientLocation();
    const { path, image, text, medium, date } = cardDetails(item);
    const queryString = location.search || (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '');
    const size = image ? sizeForImage(image) : undefined;

    return (
        <article className={cn('spotlight-item group flex flex-col', className)}>
            {image && (
                <div className="overflow-hidden">
                    <img
                        src={image}
                        alt={item.title}
                        className="block w-full h-auto"
                        loading={priority ? 'eager' : 'lazy'}
                        decoding={priority ? 'sync' : 'async'}
                        width={size?.width}
                        height={size?.height}
                    />
                </div>
            )}

            <div className="pt-5 flex flex-1 flex-col gap-3">
                <Placard
                    exhibit={[item.exhibit, categoryLabel].filter(Boolean).join(' · ') || undefined}
                    title={
                        <Link
                            to={`${path}${queryString}`}
                            state={{ from: location.pathname }}
                            className="text-inherit no-underline after:absolute after:inset-0 after:content-['']"
                        >
                            <HighlightedText text={item.title} searchTerm={searchTerm} />
                        </Link>
                    }
                    medium={medium.length > 0 && medium.map((entry, i) => (
                        <span key={entry}>
                            {i > 0 && <span className="text-ink-faint"> · </span>}
                            <HighlightedText text={entry} searchTerm={searchTerm} />
                        </span>
                    ))}
                    date={date}
                />
                {text && (
                    <p className="m-0 text-sm leading-relaxed font-body text-ink-muted">
                        <HighlightedText text={text} searchTerm={searchTerm} />
                    </p>
                )}
                <ShareButton
                    className="relative z-10 self-start mt-auto"
                    url={`${BASE_URL}${path}`}
                    title={item.title}
                    description={text}
                />
            </div>
        </article>
    );
}
