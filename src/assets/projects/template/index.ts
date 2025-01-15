import { ProjectProps } from '../../../types';
import description from './description.md?raw';

const sortedImages = Object.values(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];

export default {
    title: "",
    summary: "",
    description: description,
    technologies: [],
    githubUrl: "",
    liveUrl: "",
    images: sortedImages,
    startDate: "",
    endDate: ""
} as ProjectProps;
