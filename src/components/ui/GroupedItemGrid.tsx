import { ItemProps, ProjectProps, OrigamiProps } from "../../types";
import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    const PRIORITY_IMAGE_COUNT = 3;
    const STAGGER_SKIP_COUNT = 1;
    const [searchParams, setSearchParams] = useSearchParams();
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localSelectedTechs, setLocalSelectedTechs] = useState<string[]>([]);
    const [localSelectedTags, setLocalSelectedTags] = useState<string[]>([]);
    const [localTechFilterMode, setLocalTechFilterMode] = useState<'and' | 'or'>('or');
    const [localTagFilterMode, setLocalTagFilterMode] = useState<'and' | 'or'>('or');
    const [localSortBy, setLocalSortBy] = useState<SortOption>('date-desc');
    const [localCategoryFilter, setLocalCategoryFilter] = useState<CategoryFilter>('all');
    const [localShowGrouping, setLocalShowGrouping] = useState(initialShowGrouping);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const parseMode = (value: string | null): 'and' | 'or' => value === 'and' ? 'and' : 'or';
    const parseSort = (value: string | null): SortOption => {
        switch (value) {
            case 'date-asc':
            case 'title-asc':
            case 'title-desc':
            case 'tech-count':
                return value;
            case 'date-desc':
            default:
                return 'date-desc';
        }
    };
    const parseCategory = (value: string | null): CategoryFilter => {
        switch (value) {
            case 'my-designs':
            case 'other-designs':
            case 'software':
                return value;
            case 'all':
            default:
                return 'all';
        }
    };

    const urlSearchTerm = searchParams.get('search') || '';
    const urlSelectedTechs = searchParams.getAll('tech');
    const urlSelectedTags = searchParams.getAll('tag');
    const urlTechFilterMode = parseMode(searchParams.get('techMode'));
    const urlTagFilterMode = parseMode(searchParams.get('tagMode'));
    const urlSortBy = parseSort(searchParams.get('sort'));
    const urlCategoryFilter = parseCategory(searchParams.get('category'));
    const viewParam = searchParams.get('view');
    const urlShowGrouping = viewParam === 'grouped' ? true : viewParam === 'list' ? false : initialShowGrouping;

    const useUrlCategoryAndView = !hideControls && allowGroupingToggle;
    const searchTerm = hideControls ? localSearchTerm : urlSearchTerm;
    const selectedTechs = hideControls ? localSelectedTechs : urlSelectedTechs;
    const selectedTags = hideControls ? localSelectedTags : urlSelectedTags;
    const techFilterMode = hideControls ? localTechFilterMode : urlTechFilterMode;
    const tagFilterMode = hideControls ? localTagFilterMode : urlTagFilterMode;
    const sortBy = hideControls ? localSortBy : urlSortBy;
    const categoryFilter = useUrlCategoryAndView ? urlCategoryFilter : localCategoryFilter;
    const showGrouping = useUrlCategoryAndView ? urlShowGrouping : localShowGrouping;

    const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
        const next = new URLSearchParams(searchParams);
        updater(next);
        if (next.toString() === searchParams.toString()) return;
        setSearchParams(next, { replace: true });
    };

    const setSearchTerm: Dispatch<SetStateAction<string>> = hideControls
        ? setLocalSearchTerm
        : (value) => {
            const nextValue = typeof value === 'function'
                ? (value as (prevState: string) => string)(urlSearchTerm)
                : value;
            updateSearchParams(params => {
                if (nextValue) params.set('search', nextValue);
                else params.delete('search');
            });
        };

    const setSelectedTechs: Dispatch<SetStateAction<string[]>> = hideControls
        ? setLocalSelectedTechs
        : (value) => {
            const nextValues = typeof value === 'function'
                ? (value as (prevState: string[]) => string[])(urlSelectedTechs)
                : value;
            updateSearchParams(params => {
                params.delete('tech');
                nextValues.forEach(tech => params.append('tech', tech));
            });
        };

    const setSelectedTags: Dispatch<SetStateAction<string[]>> = hideControls
        ? setLocalSelectedTags
        : (value) => {
            const nextValues = typeof value === 'function'
                ? (value as (prevState: string[]) => string[])(urlSelectedTags)
                : value;
            updateSearchParams(params => {
                params.delete('tag');
                nextValues.forEach(tag => params.append('tag', tag));
            });
        };

    const setTechFilterMode: Dispatch<SetStateAction<'and' | 'or'>> = hideControls
        ? setLocalTechFilterMode
        : (value) => {
            const nextValue = typeof value === 'function'
                ? (value as (prevState: 'and' | 'or') => 'and' | 'or')(urlTechFilterMode)
                : value;
            updateSearchParams(params => {
                if (nextValue === 'and') params.set('techMode', 'and');
                else params.delete('techMode');
            });
        };

    const setTagFilterMode: Dispatch<SetStateAction<'and' | 'or'>> = hideControls
        ? setLocalTagFilterMode
        : (value) => {
            const nextValue = typeof value === 'function'
                ? (value as (prevState: 'and' | 'or') => 'and' | 'or')(urlTagFilterMode)
                : value;
            updateSearchParams(params => {
                if (nextValue === 'and') params.set('tagMode', 'and');
                else params.delete('tagMode');
            });
        };

    const setSortBy: Dispatch<SetStateAction<SortOption>> = hideControls
        ? setLocalSortBy
        : (value) => {
            const nextValue = typeof value === 'function'
                ? (value as (prevState: SortOption) => SortOption)(urlSortBy)
                : value;
            updateSearchParams(params => {
                if (nextValue === 'date-desc') params.delete('sort');
                else params.set('sort', nextValue);
            });
        };

    const setCategoryFilter: Dispatch<SetStateAction<CategoryFilter>> = useUrlCategoryAndView
        ? (value) => {
            const nextValue = typeof value === 'function'
                ? (value as (prevState: CategoryFilter) => CategoryFilter)(urlCategoryFilter)
                : value;
            updateSearchParams(params => {
                if (nextValue === 'all') params.delete('category');
                else params.set('category', nextValue);
            });
        }
        : setLocalCategoryFilter;

    const setShowGrouping: Dispatch<SetStateAction<boolean>> = useUrlCategoryAndView
        ? (value) => {
            const nextValue = typeof value === 'function'
                ? (value as (prevState: boolean) => boolean)(urlShowGrouping)
                : value;
            updateSearchParams(params => {
                if (nextValue === initialShowGrouping) params.delete('view');
                else params.set('view', nextValue ? 'grouped' : 'list');
            });
        }
        : setLocalShowGrouping;

    const norm = (value?: string) => (value ?? '').toLowerCase();
    const sectionHeadingText = title ?? (
        itemType === 'project'
            ? 'Projects'
            : itemType === 'origami'
                ? 'Origami'
                : 'Gallery'
    );

    const toggleGroup = (key: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const { allTechnologies, allTags } = useMemo(() => {
        // Deduplicate case-insensitively: first occurrence wins
        const techMap = new Map<string, string>();
        const tagMap = new Map<string, string>();
        items.forEach(item => {
            if (item.type === 'project') {
                (item as ProjectProps).technologies?.forEach(tech => {
                    const key = tech.toLowerCase();
                    if (!techMap.has(key)) techMap.set(key, tech);
                });
            }
            item.tags?.forEach(tag => {
                const key = tag.toLowerCase();
                if (!tagMap.has(key)) tagMap.set(key, tag);
            });
        });
        return {
            allTechnologies: Array.from(techMap.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
            allTags: Array.from(tagMap.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
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
            const techs = (item.type === 'project' ? ((item as ProjectProps).technologies ?? []) : []).map(t => t.toLowerCase());
            const selectedTechsLower = selectedTechs.map(t => t.toLowerCase());
            const matchesTech = selectedTechsLower.length === 0 || (
                techFilterMode === 'or'
                    ? selectedTechsLower.some(t => techs.includes(t))
                    : selectedTechsLower.every(t => techs.includes(t))
            );
            const tags = (item.tags ?? []).map(t => t.toLowerCase());
            const selectedTagsLower = selectedTags.map(t => t.toLowerCase());
            const matchesTag = selectedTagsLower.length === 0 || (
                tagFilterMode === 'or'
                    ? selectedTagsLower.some(t => tags.includes(t))
                    : selectedTagsLower.every(t => tags.includes(t))
            );
            const matchesTitle = norm(item.title).includes(searchLower);

            let matchesContent = false;
            if (item.type === 'project') {
                const project = item as ProjectProps;
                matchesContent = norm(project.summary).includes(searchLower) ||
                    norm(project.description).includes(searchLower);
            } else {
                const origami = item as OrigamiProps;
                matchesContent = norm(origami.description).includes(searchLower);
                // Also search designer name for other designs
                if (origami.designer) {
                    matchesContent = matchesContent || norm(origami.designer).includes(searchLower);
                }
            }

            return matchesTech && matchesTag && (searchTerm === '' || matchesTitle || matchesContent);
        });

        return [...filtered].sort((a, b) => {
            if (searchTerm) {
                // First priority: title matches
                const aTitle = norm(a.title).includes(searchLower);
                const bTitle = norm(b.title).includes(searchLower);
                if (aTitle !== bTitle) return aTitle ? -1 : 1;

                // Second priority: content matches
                const aContent = a.type === 'project' ?
                    norm((a as ProjectProps).summary).includes(searchLower) :
                    norm((a as OrigamiProps).description).includes(searchLower);
                const bContent = b.type === 'project' ?
                    norm((b as ProjectProps).summary).includes(searchLower) :
                    norm((b as OrigamiProps).description).includes(searchLower);
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
    }, [items, featuredSlugs, searchTerm, selectedTechs, selectedTags, techFilterMode, tagFilterMode, sortBy, categoryFilter]);

    const itemCounts = {
        myDesigns: myDesigns.length,
        otherDesigns: otherDesigns.length,
        software: software.length
    };

    const renderCard = (item: ItemProps, showCategoryBadge: boolean, isPriority = false) => {
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
                    priority={isPriority}
                />
            );
        } else {
            const origami = item as OrigamiProps;
            return (
                <OrigamiCard
                    key={item.slug}
                    slug={item.slug}
                    title={origami.title}
                    description={origami.description}
                    modelImages={origami.modelImages}
                    date={origami.date}
                    designer={origami.designer}
                    searchTerm={searchTerm}
                    categoryLabel={categoryLabel}
                    categoryColor={categoryCls}
                    showCategory={showCategoryBadge}
                    priority={isPriority}
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
            <h2
                className={title ? "gallery-heading text-2xl md:text-3xl mb-4" : "sr-only"}
                style={title ? { color: 'var(--color-text-primary)' } : undefined}
            >
                {sectionHeadingText}
            </h2>

            {!hideControls && (
                <GroupedSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedTechs={selectedTechs}
                    setSelectedTechs={setSelectedTechs}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    techFilterMode={techFilterMode}
                    setTechFilterMode={setTechFilterMode}
                    tagFilterMode={tagFilterMode}
                    setTagFilterMode={setTagFilterMode}
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
                    onReset={() => {
                        if (hideControls) {
                            setLocalSearchTerm('');
                            setLocalSelectedTechs([]);
                            setLocalSelectedTags([]);
                            setLocalTechFilterMode('or');
                            setLocalTagFilterMode('or');
                            setLocalSortBy('date-desc');
                            setLocalCategoryFilter('all');
                            setLocalShowGrouping(initialShowGrouping);
                            return;
                        }
                        updateSearchParams(params => {
                            params.delete('search');
                            params.delete('tech');
                            params.delete('tag');
                            params.delete('techMode');
                            params.delete('tagMode');
                            params.delete('sort');
                            params.delete('category');
                            params.delete('view');
                        });
                    }}
                />
            )}

            {showGrouping ? (
                /* Grouped view: separate sections per category */
                groupedItems.length > 0 ? (
                    <div className="space-y-10">
                        {groupedItems.map((group, groupIndex) => {
                            const isCollapsed = collapsedGroups.has(group.key);
                            return (
                                <div key={group.key}>
                                    <button
                                        onClick={() => toggleGroup(group.key)}
                                        className="flex items-center gap-3 mb-5 w-full text-left cursor-pointer bg-transparent border-none p-0 group/header"
                                    >
                                        <h2
                                            className="text-sm font-body tracking-[0.15em] uppercase transition-colors group-hover/header:!text-[var(--color-accent-text)]"
                                            style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                            {group.label}
                                            <span className="ml-2" style={{ color: 'var(--color-text-tertiary)' }}>({group.items.length})</span>
                                        </h2>
                                        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                                        <svg
                                            width="14" height="14" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            className={`transition-all duration-300 group-hover/header:!text-[var(--color-accent-text)] ${isCollapsed ? '-rotate-90' : ''}`}
                                            style={{ color: 'var(--color-text-tertiary)' }}
                                        >
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>
                                    <div
                                        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <MasonrySpotlightGrid skipCount={groupIndex === 0 ? STAGGER_SKIP_COUNT : 0}>
                                                {group.items.map((item, i) => renderCard(item, false, groupIndex === 0 && i < PRIORITY_IMAGE_COUNT))}
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
                    <MasonrySpotlightGrid skipCount={STAGGER_SKIP_COUNT}>
                        {sortedAndFilteredItems.map((item, i) => renderCard(item, true, i < PRIORITY_IMAGE_COUNT))}
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
