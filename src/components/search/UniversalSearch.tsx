import { Dispatch, SetStateAction } from 'react';
import { ItemProps } from '../../types';
import { Button } from '../ui/base';
import { formInput, formSelect } from '../../utils/styles';

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
                        }
                        }>
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}
