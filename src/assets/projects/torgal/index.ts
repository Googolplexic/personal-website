import { ProjectProps } from '../../../types';
import { attributes, body } from './description.md?parsed';


const webImages = Object.entries(import.meta.glob('./images/web/*.webp', { eager: true, import: 'default' }))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url) as string[];
const fullImages = Object.entries(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url) as string[];
const sortedImages = webImages.length > 0 ? webImages : fullImages;

const frontmatter = attributes as Partial<ProjectProps> & {
    images?: string[];
    imagesFull?: string[];
};
const frontmatterImages = Array.isArray(frontmatter.images) ? frontmatter.images : [];
const frontmatterImagesFull = Array.isArray(frontmatter.imagesFull) ? frontmatter.imagesFull : frontmatterImages;
const resolvedImages = sortedImages.length > 0 ? sortedImages : frontmatterImages;
const resolvedFullImages = fullImages.length > 0 ? fullImages : frontmatterImagesFull;



export default {
    ...frontmatter as object,
    description: body,
    images: resolvedImages,
    imagesFull: resolvedFullImages,
} as ProjectProps;
