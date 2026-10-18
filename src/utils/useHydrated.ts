import { useSyncExternalStore } from 'react';
import { useLocation, useSearchParams } from 'react-router';

const subscribeNever = () => () => {};
const EMPTY_SEARCH_PARAMS = new URLSearchParams();

/** False while React hydrates the prerendered HTML, true for every render after that. */
export function useHydrated(): boolean {
    return useSyncExternalStore(subscribeNever, () => true, () => false);
}

/*
 * Pages are prerendered without a query string or history state, so reading
 * either during hydration would render something the HTML doesn't contain.
 * These return empty values until hydration finishes, then the real ones.
 */

export function useClientSearchParams() {
    const [searchParams, setSearchParams] = useSearchParams();
    const hydrated = useHydrated();
    return [hydrated ? searchParams : EMPTY_SEARCH_PARAMS, setSearchParams] as const;
}

export function useClientLocation() {
    const location = useLocation();
    const hydrated = useHydrated();
    return hydrated ? location : { ...location, search: '', state: null };
}
