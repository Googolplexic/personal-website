import { ProjectProps } from '../../../types';
import { attributes, body } from './description.md?parsed';


const webImages = Object.values(import.meta.glob('./images/web/*.webp', { eager: true, import: 'default' }))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];
const fullImages = Object.values(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];
const sortedImages = webImages.length > 0 ? webImages : fullImages;



export default {
    ...attributes as object,
    description: body,
    images: sortedImages,
    imagesFull: fullImages,
} as ProjectProps;
