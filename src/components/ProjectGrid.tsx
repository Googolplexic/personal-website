import { Project } from "./Project";
import projects from "../assets/projects";
import { useState, useMemo } from 'react';
import { ProjectSearch, SortOption } from "./ProjectSearch";

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

        const filtered = baseProjects.filter(project => {
            const matchesTech = selectedTech === '' || project.technologies?.includes(selectedTech);
            const matchesTag = selectedTag === '' || project.tags?.includes(selectedTag);
            const matchesTitle = project.title.toLowerCase().includes(searchLower);
            const matchesSummary = project.summary.toLowerCase().includes(searchLower);
            const matchesDescription = project.description?.toLowerCase().includes(searchLower) || false;

            return matchesTech && matchesTag && (searchTerm === '' || matchesTitle || matchesSummary || matchesDescription);
        });

        return filtered.sort((a, b) => {
            if (searchTerm) {
                // First priority: title matches
                const aTitle = a.title.toLowerCase().includes(searchLower);
                const bTitle = b.title.toLowerCase().includes(searchLower);
                if (aTitle !== bTitle) return aTitle ? -1 : 1;

                // Second priority: summary matches
                const aSummary = a.summary.toLowerCase().includes(searchLower);
                const bSummary = b.summary.toLowerCase().includes(searchLower);
                if (aSummary !== bSummary) return aSummary ? -1 : 1;

                // Third priority: description matches
                const aDesc = a.description?.toLowerCase().includes(searchLower) || false;
                const bDesc = b.description?.toLowerCase().includes(searchLower) || false;
                if (aDesc !== bDesc) return aDesc ? -1 : 1;
            }

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
                <ProjectSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedTech={selectedTech}
                    setSelectedTech={setSelectedTech}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    allTechnologies={allTechnologies}
                    allTags={allTags}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedAndFilteredProjects.map((project) => (
                    <Project
                        key={project.slug}
                        {...project}
                        searchTerm={searchTerm}
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
