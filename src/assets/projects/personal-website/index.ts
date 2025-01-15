import { ProjectProps } from '../../../types';
import description from './description.md?raw';

const images = Object.values(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' })) as string[];

export default {
    title: "Personal Website",
    summary: "This site, right here!",
    description: description,
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS"],
    githubUrl: "https://github.com/googolplexic/googolplexic.github.io",
    liveUrl: "https://googolplexic.github.io",
    images: images,
    startDate: "2024-12",
} as ProjectProps;
