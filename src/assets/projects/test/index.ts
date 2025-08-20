import { ProjectProps } from '../../../types';

const images = Object.values(import.meta.glob('./images/*.{png,jpg,jpeg,webp}', { 
    eager: true, 
    import: 'default' 
})).sort((a, b) => (a as string).localeCompare(b as string)) as string[];

export default {
    title: 'test',
    summary: 'test',
    description: 'test',
    technologies: ['tse'],
    githubUrl: 'https://github.com',
    startDate: '2025-08-20',
    slug: 'test',
    images,
    keywords: ['project', 'test', ...["tse"]],
    tags: ["tse"],
    type: 'project'
} as ProjectProps;
