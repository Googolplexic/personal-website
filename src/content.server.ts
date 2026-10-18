import allProjects from './assets/projects';
import allOrigami, { myDesigns, otherDesigns } from './assets/origami';
import type { OrigamiProps, ProjectProps } from './types';

export { allProjects, allOrigami, myDesigns, otherDesigns };

/** The fields project cards and listing search read; detail pages get the full record. */
export function projectCard(project: ProjectProps): ProjectProps {
    return {
        type: 'project',
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        technologies: project.technologies,
        tags: project.tags,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        images: project.images?.slice(0, 1),
    };
}

export function origamiCard(piece: OrigamiProps): OrigamiProps {
    return {
        type: 'origami',
        category: piece.category,
        slug: piece.slug,
        title: piece.title,
        description: piece.description,
        date: piece.date,
        startDate: piece.startDate,
        designer: piece.designer,
        tags: piece.tags,
        modelImages: piece.modelImages.slice(0, 1),
    };
}

/**
 * Finds an item plus the one shown as "Next Exhibit". Exhibit numbers count up
 * from the oldest item, and the lists are sorted newest first.
 */
export function findExhibit<T extends { slug: string }>(list: T[], slug: string | undefined, prefix: 'P' | 'O') {
    const index = list.findIndex((item) => item.slug === slug);
    if (index === -1) return null;
    const nextIndex = (index - 1 + list.length) % list.length;
    const exhibitNumber = (i: number) => `${prefix}·${String(list.length - i).padStart(2, '0')}`;
    return {
        item: list[index],
        exhibit: exhibitNumber(index),
        next: list[nextIndex],
        nextExhibit: exhibitNumber(nextIndex),
    };
}
