import { ProjectProps } from '../../types';

const modules = import.meta.glob('./**/index.ts', { eager: true });
const projects: ProjectProps[] = Object.entries(modules)
    .filter(([path]) => !path.includes('/template/'))
    .map(([, module]) => (module as { default: ProjectProps }).default)
    .filter(project => project !== undefined)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

export default projects;

