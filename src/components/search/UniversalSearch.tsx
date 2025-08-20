import { Dispatch, SetStateAction } from 'react';
import { ItemProps } from '../../types';

export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'tech-count';

interface UniversalSearchProps {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    selectedTech: string;
    setSelectedTech: Dispatch<SetStateAction<string>>;
    selectedTag: string;
    setSelectedTag: Dispatch<SetStateAction<string>>;
    sortBy: SortOption;
    setSortBy: Dispatch<SetStateAction<SortOption>>;
    allTechnologies: string[];
    allTags: string[];
    items: ItemProps[];
    contentType: 'projects' | 'origami' | 'mixed';
}

export function UniversalSearch({
    searchTerm,
    setSearchTerm,
    selectedTech,
    setSelectedTech,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
    allTechnologies,
    allTags,
    items,
    contentType,
}: UniversalSearchProps) {

    const getPlaceholderText = () => {
        switch (contentType) {
            case 'projects':
                return 'Search projects...';
            case 'origami':
                return 'Search origami...';
            case 'mixed':
                return 'Search origami...';
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

    return (
        <div className="mb-6">
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
                        }
                        }>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
