import { ProjectProps } from '../../../types';
import description from './description.md?raw';

const sortedImages = Object.values(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];

export default {
    title: "Be Square",
    summary: "AI element generation/modification in Adobe Express",
    description: description,
    technologies: ['JavaScript', 'HTML/CSS', 'Adobe Creative SDK', 'Adobe Express', 'OpenAI  Whisper API', 'OpenAI GPT API', 'Node.js', 'Websockets'],
    githubUrl: "https://github.com/Googolplexic/beSquare",
    liveUrl: "",
    images: sortedImages,
    startDate: "2024-10",
    endDate: "2024-10"
} as ProjectProps;
