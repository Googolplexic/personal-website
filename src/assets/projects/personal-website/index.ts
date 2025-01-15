import { ProjectProps } from '../../../types';
import description from './description.md?raw';

const sortedImages = Object.values(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];
    
export default {
    title: "Personal Website",
    summary: "This site, right here!",
    description: description,
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS, React Router"],
    githubUrl: "https://github.com/googolplexic/personal-website",
    liveUrl: "https://www.colemanlai.com",
    images: sortedImages,
    startDate: "2024-12",
} as ProjectProps;
