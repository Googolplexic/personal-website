import { useMemo } from 'react';
import { parseFilters, writeFilters, type GalleryFilters } from './galleryFilters';
import { useClientSearchParams } from './useHydrated';

/** Listing filters kept in the query string, so a filtered view can be shared and survives Back. */
export function useGalleryFilters() {
    const [searchParams, setSearchParams] = useClientSearchParams();
    const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

    const replaceFilters = (nextFilters: GalleryFilters) => {
        const next = new URLSearchParams(searchParams);
        writeFilters(next, nextFilters);
        if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    };

    return {
        filters,
        update: (patch: Partial<GalleryFilters>) => replaceFilters({ ...filters, ...patch }),
        reset: () => replaceFilters(parseFilters(new URLSearchParams())),
    };
}
