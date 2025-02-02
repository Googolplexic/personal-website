import { Project } from "./Project";
import projects from "../assets/projects";
import { useState, useMemo } from 'react';

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'tech-count';

interface ProjectGridProps {
    projectList?: typeof projects;
    title?: string;
    className?: string;
    featuredSlugs?: string[];
    hideControls?: boolean;
}

export function ProjectGrid({
    projectList,
    featuredSlugs,
    title,
    className = "",
    hideControls = false
}: ProjectGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTech, setSelectedTech] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');

    // Get all unique technologies and tags from projects
    const { allTechnologies, allTags } = useMemo(() => {
        const techSet = new Set<string>();
        const tagSet = new Set<string>();
        projects.forEach(project => {
            project.technologies?.forEach(tech => techSet.add(tech));
            project.tags?.forEach(tag => tagSet.add(tag));
        });
        return {
            allTechnologies: Array.from(techSet).sort(),
            allTags: Array.from(tagSet).sort()
        };
    }, []);

    const sortedAndFilteredProjects = useMemo(() => {
        const baseProjects = featuredSlugs 
            ? projects.filter(project => featuredSlugs.includes(project.slug))
            : (projectList || projects);

        const searchLower = searchTerm.toLowerCase();
        
        // Filter projects
        const filtered = baseProjects.filter(project => {
            const matchesTech = selectedTech === '' || project.technologies?.includes(selectedTech);
            const matchesTag = selectedTag === '' || project.tags?.includes(selectedTag);
            const matchesSearch = searchTerm === '' || 
                project.title.toLowerCase().includes(searchLower) ||
                project.summary.toLowerCase().includes(searchLower);
            
            return matchesTech && matchesTag && matchesSearch;
        });

        // Sort projects with combined criteria
        return filtered.sort((a, b) => {
            // First priority: title matches if there's a search term
            if (searchTerm) {
                const aTitle = a.title.toLowerCase().includes(searchLower);
                const bTitle = b.title.toLowerCase().includes(searchLower);
                if (aTitle !== bTitle) {
                    return aTitle ? -1 : 1;
                }
            }

            // Second priority: selected sort option
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                case 'date-asc':
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'tech-count':
                    return (b.technologies?.length || 0) - (a.technologies?.length || 0);
                default:
                    return 0;
            }
        });
    }, [projectList, featuredSlugs, searchTerm, selectedTech, selectedTag, sortBy]);

    return (
        <section className={`mb-12 ${className}`}>
            {title && <h2 className="text-2xl font-semibold mb-6 dark:text-white">{title}</h2>}
            
            {!hideControls && (
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow flex flex-col sm:flex-row gap-4">
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
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedAndFilteredProjects.map((project) => (
                    <Project
                        key={project.slug}
                        {...project}
                    />
                ))}
            </div>
            
            {sortedAndFilteredProjects.length === 0 && (
                <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
                    No projects found matching your criteria.
                </p>
            )}
        </section>
    );
}
