import { OrigamiProps } from '../../../../types';
import { attributes } from './info.md?parsed';

// Optimized web images (from scripts/optimize-images.mjs)
const webImages = Object.values(import.meta.glob('./web/*.webp', { eager: true, import: 'default' }))
    .filter((url: unknown) => !(url as string).includes('pattern'))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];
const fullImages = Object.values(import.meta.glob('./*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }))
    .filter((url: unknown) => !(url as string).includes('pattern'))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];
const modelImages = webImages.length > 0 ? webImages : fullImages;
const modelImagesFull = fullImages;

const webCP = Object.values(import.meta.glob('./web/*pattern*.webp', { eager: true, import: 'default' }));
const fullCP = Object.values(import.meta.glob('./*pattern*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }));
const creasePattern = (webCP[0] || fullCP[0]) as string | undefined;
const creasePatternFull = fullCP[0] as string | undefined;


export default {
    title: attributes.title,
    description: attributes.description,
    date: attributes.date,
    startDate: attributes.date,
    designer: attributes.designer,
    modelImages,
    modelImagesFull,
    creasePattern,
    creasePatternFull,
    keywords: ['origami', 'paper art', attributes.title?.toLowerCase().replace(/\s+/g, '-')].filter(Boolean),
    tags: ['origami', 'other-design']
} as OrigamiProps;
