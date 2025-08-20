import { ProjectProps } from '../../types';

const getMostRecentDate = (project: ProjectProps) => new Date(project.endDate || Date.now());

const modules = import.meta.glob('./**/index.ts', { eager: true });
const projects: ProjectProps[] = Object.entries(modules)
    .filter(([path]) => !path.includes('/template/'))
    .map(([path, module]) => ({
        ...(module as { default: ProjectProps }).default,
        slug: path.split('/')[1],
        type: 'project' as const
    }))
    .filter(project => project !== undefined)
    .sort((a, b) => {
        const dateA = getMostRecentDate(a);
        const dateB = getMostRecentDate(b);
        return dateB.getTime() - dateA.getTime();
    });

export default projects;

