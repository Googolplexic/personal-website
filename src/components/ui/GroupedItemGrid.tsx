import { ItemProps, ProjectProps, OrigamiProps } from "../../types";
import { useState, useMemo } from 'react';
import { GroupedSearch, SortOption, CategoryFilter } from "../search/GroupedSearch";
import { ProjectCard } from "../portfolio/ProjectCard";
import { OrigamiCard } from "../origami/OrigamiCard";
import { Heading, Text } from "./base";
import { spacing, grid } from "../../utils/styles";

interface GroupedItemGridProps {
    items?: ItemProps[];
    title?: string;
    className?: string;
    featuredSlugs?: string[];
    hideControls?: boolean;
    itemType?: 'project' | 'origami' | 'mixed';
    showGrouping?: boolean;
    allowGroupingToggle?: boolean;
    myDesigns?: ItemProps[];
    otherDesigns?: ItemProps[];
    software?: ItemProps[];
}

export function GroupedItemGrid({
    items = [],
    featuredSlugs,
    title,
    className = "",
    hideControls = false,
    itemType = 'mixed',
    showGrouping: initialShowGrouping = false,
    allowGroupingToggle = false,
    myDesigns = [],
    otherDesigns = [],
    software = []
}: GroupedItemGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTech, setSelectedTech] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [showGrouping, setShowGrouping] = useState(initialShowGrouping);

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

    const getItemCategory = (item: ItemProps): string => {
        if (item.type === 'project') return 'software';
        const origami = item as OrigamiProps;
        return origami.category === 'my-designs' ? 'my-designs' : 'other-designs';
    };

    const getCategoryLabel = (category: string): string => {
        switch (category) {
            case 'my-designs': return 'My Design';
            case 'other-designs': return 'Other Design';
            case 'software': return 'Software';
            default: return '';
        }
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'my-designs': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'other-designs': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'software': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const sortedAndFilteredItems = useMemo(() => {
        let baseItems = featuredSlugs
            ? items.filter(item => featuredSlugs.includes(item.slug))
            : items;

        // Apply category filter
        if (categoryFilter !== 'all') {
            baseItems = baseItems.filter(item => {
                const category = getItemCategory(item);
                return category === categoryFilter;
            });
        }

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
                // Also search designer name for other designs
                if (origami.designer) {
                    matchesContent = matchesContent || origami.designer.toLowerCase().includes(searchLower);
                }
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
    }, [items, featuredSlugs, searchTerm, selectedTech, selectedTag, sortBy, categoryFilter]);

    const itemCounts = {
        myDesigns: myDesigns.length,
        otherDesigns: otherDesigns.length,
        software: software.length
    };

    return (
        <section className={`${spacing({ mb: '12' })} ${className}`}>
            {title && <Heading level={2}>{title}</Heading>}

            {!hideControls && (
                <GroupedSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedTech={selectedTech}
                    setSelectedTech={setSelectedTech}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    allTechnologies={allTechnologies}
                    allTags={allTags}
                    items={items}
                    contentType={itemType === 'mixed' ? 'mixed' : itemType === 'project' ? 'projects' : 'origami'}
                    showGrouping={showGrouping}
                    setShowGrouping={allowGroupingToggle ? setShowGrouping : undefined}
                    itemCounts={itemCounts}
                />
            )}

            <div className={grid('2', '6')}>
                {sortedAndFilteredItems.map((item) => {
                    const category = getItemCategory(item);
                    const categoryLabel = getCategoryLabel(category);
                    const categoryColor = getCategoryColor(category);

                    if (item.type === 'project') {
                        return (
                            <ProjectCard
                                key={item.slug}
                                {...(item as ProjectProps)}
                                searchTerm={searchTerm}
                                categoryLabel={categoryLabel}
                                categoryColor={categoryColor}
                                showCategory={showGrouping}
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
                                categoryLabel={categoryLabel}
                                categoryColor={categoryColor}
                                showCategory={showGrouping}
                            />
                        );
                    }
                })}
            </div>

            {sortedAndFilteredItems.length === 0 && (
                <Text color="secondary" className={`text-center ${spacing({ mt: '8' })}`}>
                    No items found matching your criteria.
                </Text>
            )}
        </section>
    );
}
