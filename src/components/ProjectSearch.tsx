import { Dispatch, SetStateAction } from 'react';

export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'tech-count';

interface ProjectSearchProps {
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
}

export function ProjectSearch({
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
}: ProjectSearchProps) {
    return (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white flex-grow"
            />
            <select
                aria-label="Filter projects by technology"
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
                <option value="">All Technologies</option>
                {allTechnologies.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                ))}
            </select>
            <select
                aria-label="Filter projects by tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                ))}
            </select>
            <select
                aria-label="Sort projects"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white min-w-[140px]"
            >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="tech-count">Most Technologies</option>
            </select>
            <button
                className='px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white border-gray-200 bg-white text-gray-900 dark:hover:bg-gray-900 hover:bg-gray-100'
                onClick={() => {
                    setSearchTerm('');
                    setSelectedTech('');
                    setSelectedTag('');
                    setSortBy('date-desc');
                }
                }>
                Reset Filters
            </button>
        </div>
    );
}
