import { useMemo } from 'react';
import { FilterBar } from '../components/search/FilterBar';
import { ExhibitGrid } from '../components/ui/ExhibitGrid';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProjectProps } from '../types';
import { collectFacets, filterAndSort, type SortOption } from '../utils/galleryFilters';
import { useGalleryFilters } from '../utils/useGalleryFilters';

const SORT_OPTIONS: SortOption[] = ['date-desc', 'date-asc', 'title-asc', 'title-desc', 'tech-count'];

export function Portfolio({ projects }: { projects: ProjectProps[] }) {
    const { filters, update, reset } = useGalleryFilters();
    const facets = useMemo(() => collectFacets(projects), [projects]);
    const visible = useMemo(() => filterAndSort(projects, filters), [projects, filters]);

    return (
        <div className="pt-32 pb-20">
            <div className="page-grid mb-12 lg:mb-16">
                <SectionHeader titleAs="h1" overline="The Gallery" title="Portfolio">
                    <p className="m-0 font-heading italic text-base">Software crafted with care.</p>
                </SectionHeader>
                <div className="col-span-full lg:col-span-9">
                    <FilterBar
                        filters={filters}
                        update={update}
                        reset={reset}
                        placeholder="Search projects..."
                        technologies={facets.technologies}
                        tags={facets.tags}
                        sortOptions={SORT_OPTIONS}
                    />
                </div>
            </div>
            <div className="page-grid">
                <div className="col-span-full">
                    <ExhibitGrid items={visible} searchTerm={filters.search} />
                </div>
            </div>
        </div>
    );
}
