import { ProjectProps } from '../../../types';
import description from './description.md?raw';
import matter from 'front-matter';

const sortedImages = Object.values(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];

const { attributes, body } = matter<ProjectProps>(description);

export default {
    ...attributes as object,
    description: body,
    images: sortedImages,
} as ProjectProps;
