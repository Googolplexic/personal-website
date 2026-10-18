import { useMemo } from 'react';
import { FilterBar } from '../components/search/FilterBar';
import { ExhibitGrid } from '../components/ui/ExhibitGrid';
import { GroupedExhibitGrid } from '../components/ui/GroupedExhibitGrid';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ItemProps, OrigamiProps, ProjectProps } from '../types';
import { CATEGORY_LABELS, collectFacets, filterAndSort, type SortOption } from '../utils/galleryFilters';
import { useGalleryFilters } from '../utils/useGalleryFilters';

const SORT_OPTIONS: SortOption[] = ['date-desc', 'date-asc', 'title-asc', 'title-desc', 'tech-count'];
const DEFAULT_VIEW = 'grouped';

interface OrigamiGalleryProps {
    myDesigns: OrigamiProps[];
    otherDesigns: OrigamiProps[];
    software: ProjectProps[];
}

export function Origami({ myDesigns, otherDesigns, software }: OrigamiGalleryProps) {
    const allItems = useMemo<ItemProps[]>(() => [...myDesigns, ...otherDesigns, ...software], [myDesigns, otherDesigns, software]);
    const { filters, update, reset } = useGalleryFilters();
    const facets = useMemo(() => collectFacets(allItems), [allItems]);
    const visible = useMemo(() => filterAndSort(allItems, filters), [allItems, filters]);
    const view = filters.view ?? DEFAULT_VIEW;

    const categories = [
        { value: 'all' as const, label: 'All', count: allItems.length },
        { value: 'my-designs' as const, label: CATEGORY_LABELS['my-designs'], count: myDesigns.length },
        { value: 'other-designs' as const, label: CATEGORY_LABELS['other-designs'], count: otherDesigns.length },
        { value: 'software' as const, label: CATEGORY_LABELS.software, count: software.length },
    ];

    return (
        <div className="pt-32 pb-20">
            <div className="page-grid mb-12 lg:mb-16">
                <SectionHeader titleAs="h1" overline="The Gallery" title="Origami">
                    <p className="m-0 font-heading italic text-base text-balance">
                        Where geometric precision meets artistic expression.
                    </p>
                    <p className="mt-3 mb-0 text-ink-faint">
                        More on{' '}
                        <a
                            href="https://www.instagram.com/12googolplex"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-underline text-gold"
                        >
                            @12googolplex
                        </a>
                    </p>
                </SectionHeader>
                <div className="col-span-full lg:col-span-9">
                    <FilterBar
                        filters={filters}
                        update={update}
                        reset={reset}
                        placeholder="Search projects and origami..."
                        technologies={facets.technologies}
                        tags={facets.tags}
                        sortOptions={SORT_OPTIONS}
                        categories={categories}
                        view={view}
                        onViewChange={(next) => update({ view: next === DEFAULT_VIEW ? null : next })}
                    />
                </div>
            </div>

            {view === 'grouped' ? (
                <GroupedExhibitGrid items={visible} searchTerm={filters.search} />
            ) : (
                <div className="page-grid">
                    <div className="col-span-full">
                        <ExhibitGrid items={visible} searchTerm={filters.search} showCategory />
                    </div>
                </div>
            )}
        </div>
    );
}
