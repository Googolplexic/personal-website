import { ItemProps, ProjectProps, OrigamiProps } from "../../types";
import { useState, useMemo } from 'react';
import { UniversalSearch, SortOption } from "../search/UniversalSearch";
import { ProjectCard } from "../portfolio/ProjectCard";
import { OrigamiCard } from "../origami/OrigamiCard";

interface ItemGridProps {
    items?: ItemProps[];
    title?: string;
    className?: string;
    featuredSlugs?: string[];
    hideControls?: boolean;
    itemType?: 'project' | 'origami' | 'mixed';
}

export function ItemGrid({
    items = [],
    featuredSlugs,
    title,
    className = "",
    hideControls = false,
    itemType = 'mixed'
}: ItemGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTech, setSelectedTech] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');

    const { allTechnologies, allTags } = useMemo(() => {
        const techSet = new Set<string>();
        const tagSet = new Set<string>();
        items.forEach(item => {
            if (item.type === 'project') {
                (item as ProjectProps).technologies?.forEach(tech => techSet.add(tech));
            }
            item.tags?.forEach(tag => tagSet.add(tag));
        });
        return {
            allTechnologies: Array.from(techSet).sort(),
            allTags: Array.from(tagSet).sort()
        };
    }, [items]);

    const sortedAndFilteredItems = useMemo(() => {
        const baseItems = featuredSlugs
            ? items.filter(item => featuredSlugs.includes(item.slug))
            : items;

        const searchLower = searchTerm.toLowerCase();

        const filtered = baseItems.filter(item => {
            const matchesTech = selectedTech === '' ||
                (item.type === 'project' && (item as ProjectProps).technologies?.includes(selectedTech));
            const matchesTag = selectedTag === '' || item.tags?.includes(selectedTag);
            const matchesTitle = item.title.toLowerCase().includes(searchLower);

            let matchesContent = false;
            if (item.type === 'project') {
                const project = item as ProjectProps;
                matchesContent = project.summary.toLowerCase().includes(searchLower) ||
                    project.description?.toLowerCase().includes(searchLower) || false;
            } else {
                const origami = item as OrigamiProps;
                matchesContent = origami.description?.toLowerCase().includes(searchLower) || false;
            }

            return matchesTech && matchesTag && (searchTerm === '' || matchesTitle || matchesContent);
        });

        return filtered.sort((a, b) => {
            if (searchTerm) {
                // First priority: title matches
                const aTitle = a.title.toLowerCase().includes(searchLower);
                const bTitle = b.title.toLowerCase().includes(searchLower);
                if (aTitle !== bTitle) return aTitle ? -1 : 1;

                // Second priority: content matches
                const aContent = a.type === 'project' ?
                    (a as ProjectProps).summary.toLowerCase().includes(searchLower) :
                    (a as OrigamiProps).description?.toLowerCase().includes(searchLower) || false;
                const bContent = b.type === 'project' ?
                    (b as ProjectProps).summary.toLowerCase().includes(searchLower) :
                    (b as OrigamiProps).description?.toLowerCase().includes(searchLower) || false;
                if (aContent !== bContent) return aContent ? -1 : 1;
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
                case 'tech-count': {
                    const aTechCount = a.type === 'project' ? ((a as ProjectProps).technologies?.length || 0) : 0;
                    const bTechCount = b.type === 'project' ? ((b as ProjectProps).technologies?.length || 0) : 0;
                    return bTechCount - aTechCount;
                }
                default:
                    return 0;
            }
        });
    }, [items, featuredSlugs, searchTerm, selectedTech, selectedTag, sortBy]);

    return (
        <section className={`mb-12 ${className}`}>
            {title && <h2 className="text-2xl font-semibold mb-6 dark:text-white">{title}</h2>}

            {!hideControls && (
                <UniversalSearch
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
                    items={items}
                    contentType={itemType === 'mixed' ? 'mixed' : itemType === 'project' ? 'projects' : 'origami'}
                />
            )}

            <div className={
                "grid grid-cols-1 lg:grid-cols-2 gap-8"
            }>
                {sortedAndFilteredItems.map((item) => {
                    if (item.type === 'project') {
                        return (
                            <ProjectCard
                                key={item.slug}
                                {...(item as ProjectProps)}
                                searchTerm={searchTerm}
                            />
                        );
                    } else {
                        const origami = item as OrigamiProps;
                        return (
                            <OrigamiCard
                                key={item.slug}
                                title={origami.title}
                                description={origami.description}
                                modelImages={origami.modelImages}
                                creasePattern={origami.creasePattern}
                                date={origami.date}
                                designer={origami.designer}
                                searchTerm={searchTerm}
                            />
                        );
                    }
                })}
            </div>

            {sortedAndFilteredItems.length === 0 && (
                <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
                    No items found matching your criteria.
                </p>
            )}
        </section>
    );
}
