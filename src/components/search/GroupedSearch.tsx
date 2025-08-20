import { Dispatch, SetStateAction } from 'react';
import { ItemProps } from '../../types';

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
                <div className="mb-4 flex justify-center">
                    <div className="flex border rounded-lg dark:border-gray-600">
                        <button
                            onClick={() => setShowGrouping(true)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${showGrouping
                                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                } rounded-l-lg`}
                        >
                            Grouped View
                        </button>
                        <button
                            onClick={() => setShowGrouping(false)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${!showGrouping
                                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                } rounded-r-lg`}
                        >
                            List View
                        </button>
                    </div>
                </div>
            )}

            {/* Category filter buttons */}
            {showGrouping && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categoryButtons.map(button => (
                            <button
                                key={button.value}
                                onClick={() => setCategoryFilter(button.value)}
                                className={`px-4 py-2 rounded-lg transition-colors ${categoryFilter === button.value
                                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {button.label}
                                {button.count !== undefined && (
                                    <span className="ml-2 text-sm opacity-75">({button.count})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and filter controls */}
            <div className="flex flex-col gap-4">
                {/* Top row: Search input (full width) */}
                <input
                    type="text"
                    placeholder={getPlaceholderText()}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                {/* Bottom row: Filters and controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {showTechFilter && (
                        <select
                            aria-label="Filter by technology"
                            value={selectedTech}
                            onChange={(e) => setSelectedTech(e.target.value)}
                            className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white flex-1 min-w-0"
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
                            className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white flex-1 min-w-0"
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
                        className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white flex-1 min-w-0"
                    >
                        {getSortOptions().map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button
                        className='px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white border-gray-200 bg-white text-gray-900 dark:hover:bg-gray-900 hover:bg-gray-100 whitespace-nowrap'
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedTech('');
                            setSelectedTag('');
                            setSortBy('date-desc');
                            setCategoryFilter('all');
                        }
                        }>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
