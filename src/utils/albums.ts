export interface ImagePair {
    modelImages: string[];
    creasePattern?: string;
}

export interface Album {
    title: string;
    modelImages: string[];
    creasePattern?: string;
    description?: string;
}

interface AlbumSection {
    title: string;
    albums: Album[];
}

// Import all images from the assets/origami directory
const myDesignsContext = import.meta.glob('../assets/origami/my-designs/**/*.{png,jpg,jpeg,webp}', { eager: true }) as Record<string, { default: string }>;
const otherDesignsContext = import.meta.glob('../assets/origami/other-designs/**/*.{png,jpg,jpeg,webp}', { eager: true }) as Record<string, { default: string }>;

function processImages(context: Record<string, { default: string }>, baseFolder: string): AlbumSection {
    const albums = new Map<string, { modelImages: string[], creasePattern?: string }>();
    
    Object.entries(context).forEach(([path, module]) => {
        const pathParts = path.split(`${baseFolder}/`)[1].split('/');
        const albumName = pathParts[0];
        const fileName = pathParts[pathParts.length - 1];
        
        if (!albums.has(albumName)) {
            albums.set(albumName, { modelImages: [] });
        }
        
        const albumData = albums.get(albumName)!;
        if (fileName.includes('-creasepattern.')) {
            albumData.creasePattern = module.default;
        } else {
            albumData.modelImages.push(module.default);
        }
    });

    return {
        title: baseFolder === 'my-designs' ? 'My Designs' : 'Other Artists\' Work',
        albums: Array.from(albums.entries())
            .filter(([, data]) => data.modelImages.length > 0)
            .map(([title, data]) => ({
                title: title.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                modelImages: data.modelImages,
                creasePattern: data.creasePattern
            }))
    };
}

export const myDesigns = processImages(myDesignsContext, 'my-designs');
export const otherDesigns = processImages(otherDesignsContext, 'other-designs');
