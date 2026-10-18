import type { ItemProps } from '../types';

export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'tech-count';
export type CategoryFilter = 'all' | 'my-designs' | 'other-designs' | 'software';
export type FilterMode = 'and' | 'or';
export type ItemCategory = Exclude<CategoryFilter, 'all'>;

export interface GalleryFilters {
    search: string;
    techs: string[];
    tags: string[];
    techMode: FilterMode;
    tagMode: FilterMode;
    sort: SortOption;
    category: CategoryFilter;
    /** null when the URL doesn't choose, so each page keeps its own default */
    view: 'grouped' | 'list' | null;
}

export const SORT_LABELS: Record<SortOption, string> = {
    'date-desc': 'Newest First',
    'date-asc': 'Oldest First',
    'title-asc': 'Title A–Z',
    'title-desc': 'Title Z–A',
    'tech-count': 'Most Technologies',
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
    'my-designs': 'My Designs',
    'other-designs': 'Other Designs',
    'software': 'Software',
};

export const CATEGORY_ORDER: ItemCategory[] = ['my-designs', 'other-designs', 'software'];

function parseSort(value: string | null): SortOption {
    switch (value) {
        case 'date-asc':
        case 'title-asc':
        case 'title-desc':
        case 'tech-count':
            return value;
        default:
            return 'date-desc';
    }
}

function parseCategory(value: string | null): CategoryFilter {
    switch (value) {
        case 'my-designs':
        case 'other-designs':
        case 'software':
            return value;
        default:
            return 'all';
    }
}

export function parseFilters(params: URLSearchParams): GalleryFilters {
    const view = params.get('view');
    return {
        search: params.get('search') || '',
        techs: params.getAll('tech'),
        tags: params.getAll('tag'),
        techMode: params.get('techMode') === 'and' ? 'and' : 'or',
        tagMode: params.get('tagMode') === 'and' ? 'and' : 'or',
        sort: parseSort(params.get('sort')),
        category: parseCategory(params.get('category')),
        view: view === 'grouped' || view === 'list' ? view : null,
    };
}

/** Writes filters back to the URL, leaving defaults out so shared links stay short. */
export function writeFilters(params: URLSearchParams, filters: GalleryFilters) {
    const setOrDelete = (key: string, value: string | null) => {
        if (value) params.set(key, value);
        else params.delete(key);
    };
    setOrDelete('search', filters.search);
    params.delete('tech');
    filters.techs.forEach(tech => params.append('tech', tech));
    params.delete('tag');
    filters.tags.forEach(tag => params.append('tag', tag));
    setOrDelete('techMode', filters.techMode === 'and' ? 'and' : null);
    setOrDelete('tagMode', filters.tagMode === 'and' ? 'and' : null);
    setOrDelete('sort', filters.sort === 'date-desc' ? null : filters.sort);
    setOrDelete('category', filters.category === 'all' ? null : filters.category);
    setOrDelete('view', filters.view);
}

export function itemCategory(item: ItemProps): ItemCategory {
    return item.type === 'project' ? 'software' : item.category;
}

/** Technologies and tags across the items, deduplicated case-insensitively (first spelling wins). */
export function collectFacets(items: ItemProps[]) {
    const techs = new Map<string, string>();
    const tags = new Map<string, string>();
    for (const item of items) {
        if (item.type === 'project') {
            item.technologies?.forEach(tech => { if (!techs.has(tech.toLowerCase())) techs.set(tech.toLowerCase(), tech); });
        }
        item.tags?.forEach(tag => { if (!tags.has(tag.toLowerCase())) tags.set(tag.toLowerCase(), tag); });
    }
    const alphabetical = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());
    return {
        technologies: [...techs.values()].sort(alphabetical),
        tags: [...tags.values()].sort(alphabetical),
    };
}

const lower = (value?: string) => (value ?? '').toLowerCase();

function matchesAll(selected: string[], values: string[], mode: FilterMode) {
    if (selected.length === 0) return true;
    const have = values.map(lower);
    const wanted = selected.map(lower);
    return mode === 'or' ? wanted.some(v => have.includes(v)) : wanted.every(v => have.includes(v));
}

function technologies(item: ItemProps) {
    return item.type === 'project' ? item.technologies ?? [] : [];
}

/** The short text shown on a card; search hits here rank above hits in the long description. */
function cardText(item: ItemProps) {
    return item.type === 'project' ? item.summary : item.description;
}

function matchesSearch(item: ItemProps, term: string) {
    if (!term) return true;
    const fields = item.type === 'project'
        ? [item.title, item.summary, item.description]
        : [item.title, item.description, item.designer];
    return fields.some(field => lower(field).includes(term));
}

function compareBySort(a: ItemProps, b: ItemProps, sort: SortOption) {
    switch (sort) {
        case 'date-desc':
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'date-asc':
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'title-asc':
            return a.title.localeCompare(b.title);
        case 'title-desc':
            return b.title.localeCompare(a.title);
        case 'tech-count':
            return technologies(b).length - technologies(a).length;
        default: {
            const unhandled: never = sort;
            return unhandled;
        }
    }
}

export function filterAndSort(items: ItemProps[], filters: GalleryFilters): ItemProps[] {
    const term = filters.search.toLowerCase();
    const filtered = items.filter(item =>
        (filters.category === 'all' || itemCategory(item) === filters.category)
        && matchesAll(filters.techs, technologies(item), filters.techMode)
        && matchesAll(filters.tags, item.tags ?? [], filters.tagMode)
        && matchesSearch(item, term));

    return filtered.sort((a, b) => {
        if (term) {
            const aTitle = lower(a.title).includes(term);
            const bTitle = lower(b.title).includes(term);
            if (aTitle !== bTitle) return aTitle ? -1 : 1;
            const aCard = lower(cardText(a)).includes(term);
            const bCard = lower(cardText(b)).includes(term);
            if (aCard !== bCard) return aCard ? -1 : 1;
        }
        return compareBySort(a, b, filters.sort);
    });
}
