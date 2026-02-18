export interface ImagePair {
    modelImages: string[];
    creasePattern?: string;
}

export interface Album {
    title: string;
    modelImages: string[];
    creasePattern?: string;
    description?: string;
    date?: string;
    slug: string;
    designer?: string;
}

interface AlbumSection {
    title: string;
    albums: Album[];
}

interface AlbumMetadata {
    title: string;
    date: string;
    description?: string;
    designer?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedMd = { attributes: Record<string, any>; body: string };

const myDesignsMetadata = import.meta.glob('../assets/origami/my-designs/**/info.md', {
    eager: true,
    query: '?parsed',
}) as Record<string, ParsedMd>;

const myDesignsImages = import.meta.glob('../assets/origami/my-designs/**/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default'
}) as Record<string, string>;

const otherDesignsMetadata = import.meta.glob('../assets/origami/other-designs/**/info.md', {
    eager: true,
    query: '?parsed',
}) as Record<string, ParsedMd>;

const otherDesignsImages = import.meta.glob('../assets/origami/other-designs/**/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default'
}) as Record<string, string>;

function processImages(metadataContext: Record<string, ParsedMd>, imagesContext: Record<string, string>, baseFolder: string): AlbumSection {
    const albums = new Map<string, {
        modelImages: string[],
        creasePattern?: string,
        metadata?: AlbumMetadata
    }>();

    Object.entries(metadataContext).forEach(([path, mod]) => {
        const albumName = path.split(`${baseFolder}/`)[1].split('/')[0];
        if (!albums.has(albumName)) {
            albums.set(albumName, { modelImages: [] });
        }
        albums.get(albumName)!.metadata = mod.attributes as AlbumMetadata;
    });

    Object.entries(imagesContext).forEach(([path, url]) => {
        const pathParts = path.split(`${baseFolder}/`)[1].split('/');
        const albumName = pathParts[0];
        const fileName = pathParts[pathParts.length - 1];

        if (!albums.has(albumName)) {
            albums.set(albumName, { modelImages: [] });
        }

        const albumData = albums.get(albumName)!;
        if (fileName.includes('-pattern.') || fileName.includes('pattern.')) {
            albumData.creasePattern = url;
        } else {
            albumData.modelImages.push(url);
        }
    });

    const processedAlbums = Array.from(albums.entries())
        .filter(([, data]) => data.modelImages.length > 0)
        .map(([slug, data]) => {
            console.log('Processing album:', slug);
            console.log('Album data:', data);
            return {
                title: data.metadata?.title || slug.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                modelImages: data.modelImages,
                creasePattern: data.creasePattern,
                date: data.metadata?.date || '2000-01',
                description: data.metadata?.description,
                designer: data.metadata?.designer,
                slug
            };
        });

    processedAlbums.sort((a, b) => b.date.localeCompare(a.date));

    return {
        title: baseFolder === 'my-designs' ? 'My Designs' : 'Other Artists\' Work',
        albums: processedAlbums
    };
}

export const myDesigns = processImages(myDesignsMetadata, myDesignsImages, 'my-designs');
export const otherDesigns = processImages(otherDesignsMetadata, otherDesignsImages, 'other-designs');
