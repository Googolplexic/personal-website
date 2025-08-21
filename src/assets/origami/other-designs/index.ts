import { OrigamiProps } from '../../../types';

const getMostRecentDate = (origami: OrigamiProps) => new Date(origami.date || origami.startDate || Date.now());

const modules = import.meta.glob('./**/index.ts', { eager: true });
const otherDesigns: OrigamiProps[] = Object.entries(modules)
    .filter(([path]) => !path.includes('/template/'))
    .map(([path, module]) => ({
        ...(module as { default: OrigamiProps }).default,
        slug: path.split('/')[1],
        category: 'other-designs' as const,
        type: 'origami' as const
    }))
    .filter(origami => origami !== undefined)
    .sort((a, b) => {
        const dateA = getMostRecentDate(a);
        const dateB = getMostRecentDate(b);
        return dateB.getTime() - dateA.getTime();
    });

export default otherDesigns; 
