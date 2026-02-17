import { Dispatch, SetStateAction } from 'react';
import { ItemProps } from '../../types';
import { Button } from '../ui/base';
import { formInput, formSelect, cn } from '../../utils/styles';

export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'tech-count';
export type CategoryFilter = 'all' | 'my-designs' | 'other-designs' | 'software';

interface UniversalSearchProps {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    selectedTech: string;
    setSelectedTech: Dispatch<SetStateAction<string>>;
    selectedTag: string;
    setSelectedTag: Dispatch<SetStateAction<string>>;
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
}

export function GroupedSearch({
    searchTerm,
    setSearchTerm,
    selectedTech,
    setSelectedTech,
    selectedTag,
    setSelectedTag,
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
}: UniversalSearchProps) {

    const getPlaceholderText = () => {
        switch (contentType) {
            case 'projects':
                return 'Search projects...';
            case 'origami':
                return 'Search origami models...';
            case 'mixed':
                return 'Search projects and origami...';
            default:
                return 'Search...';
        }
    };

    const hasProjects = items.some(item => item.type === 'project');
    const showTechFilter = hasProjects && allTechnologies.length > 0;
    const showTagFilter = allTags.length > 0;

    const getSortOptions = () => {
        const baseOptions = [
            { value: 'date-desc', label: 'Newest First' },
            { value: 'date-asc', label: 'Oldest First' },
            { value: 'title-asc', label: 'Title A-Z' },
            { value: 'title-desc', label: 'Title Z-A' },
        ];

        if (hasProjects) {
            baseOptions.push({ value: 'tech-count', label: 'Most Technologies' });
        }

        return baseOptions;
    };

    const toggleBtnClass = (active: boolean) => cn(
        'px-3 py-1 text-xs font-body tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer bg-transparent',
        active
            ? 'opacity-100 border-b border-b-[var(--color-accent)] border-t-0 border-x-0'
            : 'opacity-40 hover:opacity-70 border-b border-b-transparent border-t-0 border-x-0'
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
                        style={{ color: showGrouping ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                    >
                        Grouped View
                    </button>
                    <button
                        onClick={() => setShowGrouping(false)}
                        className={toggleBtnClass(!showGrouping)}
                        style={{ color: !showGrouping ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
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
                                style={{ color: categoryFilter === button.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                            >
                                {button.label}
                                {button.count !== undefined && (
                                    <span className="ml-1.5 text-xs opacity-50">({button.count})</span>
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
                        <select
                            aria-label="Filter by technology"
                            value={selectedTech}
                            onChange={(e) => setSelectedTech(e.target.value)}
                            className={formSelect()}
                        >
                            <option value="">All Technologies</option>
                            {allTechnologies.map(tech => (
                                <option key={tech} value={tech}>{tech}</option>
                            ))}
                        </select>
                    )}

                    {showTagFilter && (
                        <select
                            aria-label="Filter by tag"
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className={formSelect()}
                        >
                            <option value="">All Tags</option>
                            {allTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    )}

                    <select
                        aria-label="Sort items"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className={formSelect()}
                    >
                        {getSortOptions().map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <Button
                        variant="secondary"
                        className="px-4 py-2 whitespace-nowrap"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedTech('');
                            setSelectedTag('');
                            setSortBy('date-desc');
                            setCategoryFilter('all');
                        }
                        }>
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}
