import { ProjectProps } from '../../types';

const modules = import.meta.glob('./**/index.ts', { eager: true });
const projects: ProjectProps[] = Object.entries(modules)
    .filter(([path]) => !path.includes('/template/'))
    .map(([, module]) => (module as { default: ProjectProps }).default)
    .filter(project => project !== undefined);

export default projects;

