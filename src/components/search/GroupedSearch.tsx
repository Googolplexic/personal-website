import { Dispatch, SetStateAction } from 'react';
import { ItemProps } from '../../types';
import { Button } from '../ui/base';
import { formInput, cn } from '../../utils/styles';
import { MultiSelect } from '../ui/MultiSelect';

const SORT_LABELS: Record<string, string> = {
    'date-desc': 'Newest First',
    'date-asc': 'Oldest First',
    'title-asc': 'Title A–Z',
    'title-desc': 'Title Z–A',
    'tech-count': 'Most Technologies',
};

export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'tech-count';
export type CategoryFilter = 'all' | 'my-designs' | 'other-designs' | 'software';

interface GroupedSearchProps {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    selectedTechs: string[];
    setSelectedTechs: Dispatch<SetStateAction<string[]>>;
    selectedTags: string[];
    setSelectedTags: Dispatch<SetStateAction<string[]>>;
    techFilterMode: 'and' | 'or';
    setTechFilterMode: Dispatch<SetStateAction<'and' | 'or'>>;
    tagFilterMode: 'and' | 'or';
    setTagFilterMode: Dispatch<SetStateAction<'and' | 'or'>>;
    sortBy: SortOption;
    setSortBy: Dispatch<SetStateAction<SortOption>>;
    categoryFilter: CategoryFilter;
    setCategoryFilter: Dispatch<SetStateAction<CategoryFilter>>;
    allTechnologies: string[];
    allTags: string[];
    items: ItemProps[];
    contentType: 'projects' | 'origami' | 'mixed';
    showGrouping?: boolean;
    setShowGrouping?: Dispatch<SetStateAction<boolean>>;
    itemCounts?: {
        myDesigns: number;
        otherDesigns: number;
        software: number;
    };
    onReset: () => void;
}

export function GroupedSearch({
    searchTerm,
    setSearchTerm,
    selectedTechs,
    setSelectedTechs,
    selectedTags,
    setSelectedTags,
    techFilterMode,
    setTechFilterMode,
    tagFilterMode,
    setTagFilterMode,
    sortBy,
    setSortBy,
    categoryFilter,
    setCategoryFilter,
    allTechnologies,
    allTags,
    items,
    contentType,
    showGrouping = false,
    setShowGrouping,
    itemCounts,
    onReset,
}: GroupedSearchProps) {

    const getPlaceholderText = () => {
        switch (contentType) {
            case 'projects': return 'Search projects...';
            case 'origami': return 'Search origami models...';
            case 'mixed': return 'Search projects and origami...';
            default: return 'Search...';
        }
    };

    const hasProjects = items.some(item => item.type === 'project');
    const showTechFilter = hasProjects && allTechnologies.length > 0;
    const showTagFilter = allTags.length > 0;

    const sortOptions = [
        'date-desc',
        'date-asc',
        'title-asc',
        'title-desc',
        ...(hasProjects ? ['tech-count'] : []),
    ];

    const toggleBtnClass = (active: boolean) => cn(
        'px-3 py-1 text-xs font-body tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer bg-transparent',
        active
            ? 'opacity-100 border-b border-b-[var(--color-accent)] border-t-0 border-x-0'
            : 'opacity-75 hover:opacity-90 border-b border-b-transparent hover:border-b-[var(--color-accent-text)] border-t-0 border-x-0'
    );

    const categoryButtons = [
        { value: 'all' as CategoryFilter, label: 'All', count: itemCounts ? itemCounts.myDesigns + itemCounts.otherDesigns + itemCounts.software : undefined },
        { value: 'my-designs' as CategoryFilter, label: 'My Designs', count: itemCounts?.myDesigns },
        { value: 'other-designs' as CategoryFilter, label: 'Other Designs', count: itemCounts?.otherDesigns },
        { value: 'software' as CategoryFilter, label: 'Software', count: itemCounts?.software },
    ];

    return (
        <div className="mb-6">
            {/* View toggle */}
            {setShowGrouping && (
                <div className="mb-4 flex justify-center gap-2">
                    <button
                        onClick={() => setShowGrouping(true)}
                        className={toggleBtnClass(showGrouping)}
                        style={{ color: showGrouping ? 'var(--color-accent-text)' : 'var(--color-text-secondary)' }}
                    >
                        Grouped View
                    </button>
                    <button
                        onClick={() => setShowGrouping(false)}
                        className={toggleBtnClass(!showGrouping)}
                        style={{ color: !showGrouping ? 'var(--color-accent-text)' : 'var(--color-text-secondary)' }}
                    >
                        List View
                    </button>
                </div>
            )}

            {/* Category filter buttons */}
            {setShowGrouping && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categoryButtons.map(button => (
                            <button
                                key={button.value}
                                onClick={() => setCategoryFilter(button.value)}
                                className={toggleBtnClass(categoryFilter === button.value)}
                                style={{ color: categoryFilter === button.value ? 'var(--color-accent-text)' : 'var(--color-text-secondary)' }}
                            >
                                {button.label}
                                {button.count !== undefined && (
                                    <span className="ml-1.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>({button.count})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and filter controls */}
            <div className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder={getPlaceholderText()}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={formInput()}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    {showTechFilter && (
                        <MultiSelect
                            aria-label="Filter by technology"
                            options={allTechnologies}
                            selected={selectedTechs}
                            onChange={setSelectedTechs}
                            filterMode={techFilterMode}
                            onFilterModeChange={setTechFilterMode}
                            placeholder="All Technologies"
                        />
                    )}

                    {showTagFilter && (
                        <MultiSelect
                            aria-label="Filter by tag"
                            options={allTags}
                            selected={selectedTags}
                            onChange={setSelectedTags}
                            filterMode={tagFilterMode}
                            onFilterModeChange={setTagFilterMode}
                            placeholder="All Tags"
                        />
                    )}

                    <MultiSelect
                        aria-label="Sort items"
                        options={sortOptions}
                        optionLabels={SORT_LABELS}
                        selected={[sortBy]}
                        onChange={([v]) => setSortBy((v ?? 'date-desc') as SortOption)}
                        placeholder="Sort"
                        singleSelect
                    />

                    <Button
                        variant="secondary"
                        className="px-4 py-2 whitespace-nowrap"
                        onClick={onReset}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}
