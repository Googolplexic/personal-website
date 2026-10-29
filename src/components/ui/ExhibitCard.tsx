import { useRef } from 'react';
import { Link, useViewTransitionState } from 'react-router';
import type { ItemProps } from '../../types';
import { BASE_URL } from '../../utils/seo';
import { cn } from '../../utils/styles';
import { useClientLocation } from '../../utils/useHydrated';
import { exhibitTransition, rememberPreview } from '../../utils/viewTransition';
import { HighlightedText } from './HighlightedText';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Placard } from './Placard';
import { ShareButton } from './ShareButton';

// Widest rendered image across the listings at each breakpoint (the page grid stops growing at 90rem),
// so standard-density desktops get the 600px copy and high-density screens the 1280px one
const CARD_IMAGE_SIZES = '(min-width: 1440px) 480px, (min-width: 1024px) 32vw, (min-width: 768px) 43vw, 100vw';
const LEAD_IMAGE_SIZES = '(min-width: 1440px) 580px, (min-width: 768px) 40vw, 100vw';

interface ExhibitCardProps {
    item: ItemProps;
    searchTerm?: string;
    /** Collection name added to the exhibit line in mixed listings */
    categoryLabel?: string;
    priority?: boolean;
    /** lead: the image and a larger placard side by side, for the first piece of an exhibition */
    layout?: 'stacked' | 'lead';
    /** h2 when the card sits directly under the page's h1, h3 under a section heading */
    titleAs?: 'h2' | 'h3';
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
export function ExhibitCard({ item, searchTerm = '', categoryLabel, priority = false, layout = 'stacked', titleAs = 'h3', className }: ExhibitCardProps) {
    const location = useClientLocation();
    const { path, image, text, medium, date } = cardDetails(item);
    const queryString = location.search || (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '');
    const set = image ? item.imageSets?.[image] : undefined;
    const lead = layout === 'lead';
    const transitioning = useViewTransitionState(path);
    const imageRef = useRef<HTMLImageElement>(null);

    return (
        <article className={cn(
            // The title link covers the card, so its focus ring goes round the whole card
            'spotlight-item group flex flex-col outline-offset-8 has-[a:focus-visible]:outline-1 has-[a:focus-visible]:outline-solid has-[a:focus-visible]:outline-gold',
            lead && 'md:grid md:grid-cols-12 md:gap-x-(--grid-gutter) md:items-end',
            className,
        )}>
            {image && (
                <div
                    className={cn('relative overflow-hidden vt-exhibit', lead && 'md:col-span-7')}
                    style={exhibitTransition(item.slug, transitioning)}
                >
                    <ImagePlaceholder set={set} />
                    <img
                        ref={imageRef}
                        src={image}
                        srcSet={set?.srcSet}
                        sizes={set && (lead ? LEAD_IMAGE_SIZES : CARD_IMAGE_SIZES)}
                        alt={item.title}
                        data-fade
                        className="relative block w-full h-auto"
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : undefined}
                        decoding="async"
                        width={set?.width}
                        height={set?.height}
                    />
                </div>
            )}

            <div className={cn('pt-5 flex flex-1 flex-col gap-3', lead && 'md:col-span-5 md:pt-0 md:gap-5')}>
                <Placard
                    size={lead ? 'page' : 'card'}
                    titleAs={titleAs}
                    exhibit={[item.exhibit, categoryLabel].filter(Boolean).join(' · ') || undefined}
                    title={
                        <Link
                            to={`${path}${queryString}`}
                            state={{ from: location.pathname }}
                            viewTransition
                            prefetch="intent"
                            onClick={() => rememberPreview(item.slug, imageRef.current)}
                            className="text-inherit no-underline focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
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
                    <p className={cn('m-0 leading-relaxed font-body text-ink-muted', lead ? 'text-base' : 'text-sm')}>
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
