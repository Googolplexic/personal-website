/**
 * Utility for handling lazy-loaded images to optimize bundle size
 */

export type LazyImageLoader = () => Promise<string>;

export interface LazyImageCollection {
    loaders: LazyImageLoader[];
    resolved: string[];
    loading: boolean[];
}

/**
 * Create a lazy image collection from import.meta.glob
 */
export function createLazyImageCollection(
    imageModules: Record<string, () => Promise<unknown>>
): LazyImageCollection {
    const sortedPaths = Object.keys(imageModules).sort((a, b) => a.localeCompare(b));
    const loaders = sortedPaths.map(path => imageModules[path] as LazyImageLoader);

    return {
        loaders,
        resolved: new Array(loaders.length).fill(''),
        loading: new Array(loaders.length).fill(false)
    };
}

/**
 * Load a specific image by index
 */
export async function loadImage(
    collection: LazyImageCollection,
    index: number
): Promise<string> {
    if (index < 0 || index >= collection.loaders.length) {
        throw new Error(`Invalid image index: ${index}`);
    }

    // Return already resolved image
    if (collection.resolved[index]) {
        return collection.resolved[index];
    }

    // Prevent duplicate loading
    if (collection.loading[index]) {
        // Wait for ongoing load to complete
        while (collection.loading[index]) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return collection.resolved[index];
    }

    try {
        collection.loading[index] = true;
        const url = await collection.loaders[index]();
        collection.resolved[index] = url;
        return url;
    } finally {
        collection.loading[index] = false;
    }
}

/**
 * Load all images in a collection
 */
export async function loadAllImages(
    collection: LazyImageCollection
): Promise<string[]> {
    const promises = collection.loaders.map((_, index) => loadImage(collection, index));
    return Promise.all(promises);
}

/**
 * Get resolved images with fallback placeholders for unloaded ones
 */
export function getResolvedImages(
    collection: LazyImageCollection,
    placeholder = ''
): string[] {
    return collection.resolved.map(url => url || placeholder);
}
