import { OrigamiProps } from '../../../../types';
import info from './info.md?raw';
import matter from 'front-matter';

interface OrigamiMetadata {
    title: string;
    date: string;
    description?: string;
    designer?: string;
}

// Load all images in this folder (excluding patterns)
const modelImages = Object.values(import.meta.glob('./*.{png,jpg,jpeg,webp}', { 
    eager: true, 
    import: 'default' 
}))
.filter((url: unknown) => !(url as string).includes('pattern'))
.sort((a, b) => (a as string).localeCompare(b as string)) as string[];

// Load crease pattern if it exists
const creasePatternModules = import.meta.glob('./*pattern*.{png,jpg,jpeg,webp}', { 
    eager: true, 
    import: 'default' 
});
const creasePattern = Object.values(creasePatternModules)[0] as string | undefined;

// Parse metadata from info.md
const { attributes } = matter<OrigamiMetadata>(info);

export default {
    title: attributes.title,
    description: attributes.description,
    date: attributes.date,
    startDate: attributes.date,
    designer: attributes.designer,
    modelImages,
    creasePattern,
    keywords: ['origami', 'paper art', attributes.title?.toLowerCase().replace(/\s+/g, '-'), attributes.designer?.toLowerCase().replace(/\s+/g, '-')].filter(Boolean),
    tags: ['origami', 'other-design']
} as OrigamiProps;
