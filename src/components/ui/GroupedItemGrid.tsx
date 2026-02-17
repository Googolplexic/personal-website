import { ItemProps, ProjectProps, OrigamiProps } from "../../types";
import { useState, useMemo } from 'react';
import { GroupedSearch, SortOption, CategoryFilter } from "../search/GroupedSearch";
import { ProjectCard } from "../portfolio/ProjectCard";
import { OrigamiCard } from "../origami/OrigamiCard";
import { MasonrySpotlightGrid } from "./MasonrySpotlightGrid";

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
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = (key: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

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
            case 'my-designs': return 'My Designs';
            case 'other-designs': return 'Other Designs';
            case 'software': return 'Software';
            default: return '';
        }
    };

    const getCategoryClass = (category: string): string => {
        switch (category) {
            case 'my-designs': return 'gallery-cat-green';
            case 'other-designs': return 'gallery-cat-blue';
            case 'software': return 'gallery-cat-purple';
            default: return 'gallery-cat-default';
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

    const renderCard = (item: ItemProps, showCategoryBadge: boolean) => {
        const category = getItemCategory(item);
        const categoryLabel = getCategoryLabel(category);
        const categoryCls = getCategoryClass(category);

        if (item.type === 'project') {
            return (
                <ProjectCard
                    key={item.slug}
                    {...(item as ProjectProps)}
                    searchTerm={searchTerm}
                    categoryLabel={categoryLabel}
                    categoryColor={categoryCls}
                    showCategory={showCategoryBadge}
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
                    categoryColor={categoryCls}
                    showCategory={showCategoryBadge}
                />
            );
        }
    };

    // Group items by category for grouped view
    const groupedItems = useMemo(() => {
        const groups: { key: string; label: string; items: ItemProps[] }[] = [];
        const categoryOrder = ['my-designs', 'other-designs', 'software'];

        for (const cat of categoryOrder) {
            const catItems = sortedAndFilteredItems.filter(item => getItemCategory(item) === cat);
            if (catItems.length > 0) {
                groups.push({
                    key: cat,
                    label: getCategoryLabel(cat),
                    items: catItems,
                });
            }
        }

        return groups;
    }, [sortedAndFilteredItems]);

    return (
        <section className={`mb-12 ${className}`}>
            {title && <h2 className="gallery-heading text-2xl md:text-3xl mb-4" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>}

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

            {showGrouping ? (
                /* Grouped view: separate sections per category */
                groupedItems.length > 0 ? (
                    <div className="space-y-10">
                        {groupedItems.map(group => {
                            const isCollapsed = collapsedGroups.has(group.key);
                            return (
                                <div key={group.key}>
                                    <button
                                        onClick={() => toggleGroup(group.key)}
                                        className="flex items-center gap-3 mb-5 w-full text-left cursor-pointer bg-transparent border-none p-0 group"
                                    >
                                        <h3
                                            className="text-sm font-body tracking-[0.15em] uppercase transition-colors"
                                            style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                            {group.label}
                                            <span className="ml-2 opacity-50">({group.items.length})</span>
                                        </h3>
                                        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                                        <svg
                                            width="14" height="14" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            className={`transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}
                                            style={{ color: 'var(--color-text-tertiary)' }}
                                        >
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>
                                    <div
                                        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                                            isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                                        }`}
                                    >
                                        <div className="overflow-hidden">
                                            <MasonrySpotlightGrid>
                                                {group.items.map(item => renderCard(item, false))}
                                            </MasonrySpotlightGrid>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center mt-8 font-body" style={{ color: 'var(--color-text-secondary)' }}>
                        No items found matching your criteria.
                    </p>
                )
            ) : (
                /* List view: flat masonry with category badges */
                <>
                    <MasonrySpotlightGrid>
                        {sortedAndFilteredItems.map(item => renderCard(item, true))}
                    </MasonrySpotlightGrid>

                    {sortedAndFilteredItems.length === 0 && (
                        <p className="text-center mt-8 font-body" style={{ color: 'var(--color-text-secondary)' }}>
                            No items found matching your criteria.
                        </p>
                    )}
                </>
            )}
        </section>
    );
}
