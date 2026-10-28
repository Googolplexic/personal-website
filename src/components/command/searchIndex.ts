/** One piece in /search-index.json (routes/search-index.ts). */
export interface SearchEntry {
    title: string;
    path: string;
    section: 'Portfolio' | 'Origami';
    /** Short line under the title: technologies, or designer and date */
    detail: string;
    /** Extra text that matches but isn't shown */
    keywords: string;
}

let request: Promise<SearchEntry[]> | null = null;

/** Fetched once per visit; a failed fetch is retried the next time the menu opens. */
export function loadSearchIndex(): Promise<SearchEntry[]> {
    request ??= fetch('/search-index.json')
        .then((response) => {
            if (!response.ok) throw new Error(`search-index.json: ${response.status}`);
            return response.json() as Promise<SearchEntry[]>;
        })
        .catch((error: unknown) => {
            request = null;
            throw error;
        });
    return request;
}

const normalize = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

/**
 * How well an item matches the query, or 0 for no match. Every word has to
 * appear somewhere; titles that start with (or contain) the query rank first.
 */
export function matchScore(query: string, title: string, extra = ''): number {
    const q = normalize(query.trim());
    if (!q) return 1;
    const t = normalize(title);
    const haystack = `${t} ${normalize(extra)}`;
    const words = q.split(/\s+/);
    if (!words.every((word) => haystack.includes(word))) return 0;
    if (t.startsWith(q)) return 4;
    if (t.split(/[\s-]+/).some((word) => word.startsWith(q))) return 3;
    if (t.includes(q)) return 2;
    return 1;
}
