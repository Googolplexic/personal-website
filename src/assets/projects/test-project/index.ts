import { ProjectProps } from '../../../types';

const images = Object.values(import.meta.glob('./images/*.{png,jpg,jpeg,webp}', { 
    eager: true, 
    import: 'default' 
})).sort((a, b) => (a as string).localeCompare(b as string)) as string[];

export default {
    title: 'Test project',
    summary: 'This is a test',
    description: '## YOOOOO

This is a test',
    technologies: [],
    githubUrl: 'https://github.com',
    startDate: '2025-08-20',
    slug: 'test-project',
    images,
    keywords: ['project', 'test project', ...[]],
    tags: [],
    type: 'project'
} as ProjectProps;
