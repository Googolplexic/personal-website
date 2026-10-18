import type { ItemProps } from '../../types';
import { CATEGORY_LABELS, itemCategory } from '../../utils/galleryFilters';
import { ExhibitCard } from './ExhibitCard';
import { MasonrySpotlightGrid } from './MasonrySpotlightGrid';

const PRIORITY_IMAGE_COUNT = 3;

interface ExhibitGridProps {
    items: ItemProps[];
    searchTerm?: string;
    /** Adds the collection name to each placard, for listings that mix collections */
    showCategory?: boolean;
    /** False for grids below the fold, whose images can all load lazily */
    priority?: boolean;
    /** Items shown at once instead of staggering in, so the first row isn't held back */
    skipCount?: number;
    maxColumns?: 2 | 3;
}

export function ExhibitGrid({ items, searchTerm, showCategory = false, priority = true, skipCount = 1, maxColumns }: ExhibitGridProps) {
    if (items.length === 0) {
        return (
            <p className="mt-8 font-body text-ink-muted">
                No items found matching your criteria.
            </p>
        );
    }

    return (
        <MasonrySpotlightGrid skipCount={skipCount} maxColumns={maxColumns}>
            {items.map((item, i) => (
                <ExhibitCard
                    key={item.slug}
                    item={item}
                    searchTerm={searchTerm}
                    categoryLabel={showCategory ? CATEGORY_LABELS[itemCategory(item)] : undefined}
                    priority={priority && i < PRIORITY_IMAGE_COUNT}
                />
            ))}
        </MasonrySpotlightGrid>
    );
}
