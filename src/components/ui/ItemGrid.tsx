import { ItemProps, ProjectProps, OrigamiProps } from "../../types";
import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UniversalSearch, SortOption } from "../search/UniversalSearch";
import { ProjectCard } from "../portfolio/ProjectCard";
import { OrigamiCard } from "../origami/OrigamiCard";
import { MasonrySpotlightGrid } from "./MasonrySpotlightGrid";

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
    const PRIORITY_IMAGE_COUNT = 3;
    const STAGGER_SKIP_COUNT = 1;
    const [searchParams, setSearchParams] = useSearchParams();
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localSelectedTechs, setLocalSelectedTechs] = useState<string[]>([]);
    const [localSelectedTags, setLocalSelectedTags] = useState<string[]>([]);
    const [localTechFilterMode, setLocalTechFilterMode] = useState<'and' | 'or'>('or');
    const [localTagFilterMode, setLocalTagFilterMode] = useState<'and' | 'or'>('or');
    const [localSortBy, setLocalSortBy] = useState<SortOption>('date-desc');

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

    const urlSearchTerm = searchParams.get('search') || '';
    const urlSelectedTechs = searchParams.getAll('tech');
    const urlSelectedTags = searchParams.getAll('tag');
    const urlTechFilterMode = parseMode(searchParams.get('techMode'));
    const urlTagFilterMode = parseMode(searchParams.get('tagMode'));
    const urlSortBy = parseSort(searchParams.get('sort'));

    const searchTerm = hideControls ? localSearchTerm : urlSearchTerm;
    const selectedTechs = hideControls ? localSelectedTechs : urlSelectedTechs;
    const selectedTags = hideControls ? localSelectedTags : urlSelectedTags;
    const techFilterMode = hideControls ? localTechFilterMode : urlTechFilterMode;
    const tagFilterMode = hideControls ? localTagFilterMode : urlTagFilterMode;
    const sortBy = hideControls ? localSortBy : urlSortBy;

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
    const norm = (value?: string) => (value ?? '').toLowerCase();
    const sectionHeadingText = title ?? (
        itemType === 'project'
            ? 'Projects'
            : itemType === 'origami'
                ? 'Origami'
                : 'Gallery'
    );

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

    const sortedAndFilteredItems = useMemo(() => {
        const baseItems = featuredSlugs
            ? items.filter(item => featuredSlugs.includes(item.slug))
            : items;

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
    }, [items, featuredSlugs, searchTerm, selectedTechs, selectedTags, techFilterMode, tagFilterMode, sortBy]);

    return (
        <section className={`mb-12 ${className}`}>
            <h2
                className={title ? "gallery-heading text-2xl md:text-3xl mb-6" : "sr-only"}
                style={title ? { color: 'var(--color-text-primary)' } : undefined}
            >
                {sectionHeadingText}
            </h2>

            {!hideControls && (
                <UniversalSearch
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
                    allTechnologies={allTechnologies}
                    allTags={allTags}
                    items={items}
                    contentType={itemType === 'mixed' ? 'mixed' : itemType === 'project' ? 'projects' : 'origami'}
                    onReset={() => {
                        if (hideControls) {
                            setLocalSearchTerm('');
                            setLocalSelectedTechs([]);
                            setLocalSelectedTags([]);
                            setLocalTechFilterMode('or');
                            setLocalTagFilterMode('or');
                            setLocalSortBy('date-desc');
                            return;
                        }
                        updateSearchParams(params => {
                            params.delete('search');
                            params.delete('tech');
                            params.delete('tag');
                            params.delete('techMode');
                            params.delete('tagMode');
                            params.delete('sort');
                        });
                    }}
                />
            )}

            <MasonrySpotlightGrid skipCount={STAGGER_SKIP_COUNT}>
                {sortedAndFilteredItems.map((item, index) => {
                    const isPriority = index < PRIORITY_IMAGE_COUNT;
                    if (item.type === 'project') {
                        return (
                            <ProjectCard
                                key={item.slug}
                                {...(item as ProjectProps)}
                                searchTerm={searchTerm}
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
                                priority={isPriority}
                            />
                        );
                    }
                })}
            </MasonrySpotlightGrid>

            {sortedAndFilteredItems.length === 0 && (
                <p className="text-center mt-8 font-body" style={{ color: 'var(--color-text-secondary)' }}>
                    No items found matching your criteria.
                </p>
            )}
        </section>
    );
}
