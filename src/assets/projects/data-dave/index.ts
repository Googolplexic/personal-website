import { ProjectProps } from '../../../types';
import description from './description.md?raw';
import matter from 'front-matter';
import { createLazyImageCollection } from '../../../utils/lazyImages';

// Use lazy loading to avoid bundling all images into main chunk
const imageModules = import.meta.glob('./images/*.(png|jpg|jpeg)', { import: 'default' });
const lazyImages = createLazyImageCollection(imageModules);

const { attributes, body } = matter<ProjectProps>(description);

export default {
    ...attributes as object,
    description: body,
    images: lazyImages,
} as ProjectProps;
