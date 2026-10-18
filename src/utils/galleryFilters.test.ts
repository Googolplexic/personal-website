import { describe, expect, it } from 'vitest';
import type { OrigamiProps, ProjectProps } from '../types';
import { collectFacets, filterAndSort, parseFilters, writeFilters, type GalleryFilters } from './galleryFilters';

function project(overrides: Partial<ProjectProps>): ProjectProps {
    return {
        type: 'project', title: 'Project', slug: 'project', summary: '', description: '',
        technologies: [], githubUrl: '', startDate: '2024-01', ...overrides,
    };
}

function origami(overrides: Partial<OrigamiProps>): OrigamiProps {
    return {
        type: 'origami', title: 'Model', slug: 'model', modelImages: [], date: '2024-01',
        startDate: '2024-01', category: 'my-designs', ...overrides,
    };
}

const defaults = parseFilters(new URLSearchParams());

function run(items: Parameters<typeof filterAndSort>[0], filters: Partial<GalleryFilters>) {
    return filterAndSort(items, { ...defaults, ...filters }).map(item => item.slug);
}

describe('parseFilters / writeFilters', () => {
    it('falls back to defaults for missing or unknown values', () => {
        expect(parseFilters(new URLSearchParams('sort=bogus&category=nope&view=grid&techMode=xor'))).toEqual(defaults);
        expect(defaults).toMatchObject({ sort: 'date-desc', category: 'all', techMode: 'or', view: null });
    });

    it('round-trips through the URL, leaving defaults out', () => {
        const filters: GalleryFilters = {
            ...defaults, search: 'crane', techs: ['React', 'Python'], tagMode: 'and', sort: 'title-asc', view: 'list',
        };
        const params = new URLSearchParams('unrelated=1');
        writeFilters(params, filters);
        expect(params.toString()).toBe('unrelated=1&search=crane&tech=React&tech=Python&tagMode=and&sort=title-asc&view=list');
        expect(parseFilters(params)).toEqual(filters);

        writeFilters(params, defaults);
        expect(params.toString()).toBe('unrelated=1');
    });
});

describe('filterAndSort', () => {
    const items = [
        project({ slug: 'old', title: 'Alpha', startDate: '2020-01', technologies: ['React', 'Python'], tags: ['web'] }),
        project({ slug: 'new', title: 'Beta', startDate: '2025-01', technologies: ['react'], summary: 'A crane tool' }),
        origami({ slug: 'crane', title: 'Crane', startDate: '2022-01', category: 'other-designs', designer: 'Robert Lang' }),
        origami({ slug: 'owl', title: 'Owl', startDate: '2023-01', description: 'folded from a crane base' }),
    ];

    it('sorts newest first by default', () => {
        expect(run(items, {})).toEqual(['new', 'owl', 'crane', 'old']);
        expect(run(items, { sort: 'date-asc' })).toEqual(['old', 'crane', 'owl', 'new']);
    });

    it('filters by category', () => {
        expect(run(items, { category: 'software' })).toEqual(['new', 'old']);
        expect(run(items, { category: 'other-designs' })).toEqual(['crane']);
    });

    it('matches technologies case-insensitively, with OR and AND modes', () => {
        expect(run(items, { techs: ['REACT'] })).toEqual(['new', 'old']);
        expect(run(items, { techs: ['react', 'python'], techMode: 'or' })).toEqual(['new', 'old']);
        expect(run(items, { techs: ['react', 'python'], techMode: 'and' })).toEqual(['old']);
    });

    it('ranks search hits in the title, then the card text, then elsewhere', () => {
        expect(run(items, { search: 'Crane' })).toEqual(['crane', 'new', 'owl']);
    });

    it('searches origami designers', () => {
        expect(run(items, { search: 'lang' })).toEqual(['crane']);
    });
});

describe('collectFacets', () => {
    it('dedupes case-insensitively, keeping the first spelling, and sorts', () => {
        const facets = collectFacets([
            project({ technologies: ['TypeScript', 'react'], tags: ['Web'] }),
            project({ technologies: ['React', 'Python'], tags: ['web', 'cli'] }),
            origami({ tags: ['Modular'] }),
        ]);
        expect(facets).toEqual({ technologies: ['Python', 'react', 'TypeScript'], tags: ['cli', 'Modular', 'Web'] });
    });
});
