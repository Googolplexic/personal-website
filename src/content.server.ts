import allProjects from './assets/projects';
import allOrigami, { myDesigns, otherDesigns } from './assets/origami';
import { imageSets } from './images.server';
import type { OrigamiProps, ProjectProps } from './types';

export { allProjects, allOrigami, myDesigns, otherDesigns };

/** Exhibit numbers count up from the oldest item; the lists are sorted newest first. */
function exhibitCode(list: { slug: string }[], index: number, prefix: 'P' | 'O') {
    return `${prefix}·${String(list.length - index).padStart(2, '0')}`;
}

/** The fields project cards and listing search read; detail pages get the full record. */
export function projectCard(project: ProjectProps): ProjectProps {
    return {
        type: 'project',
        slug: project.slug,
        exhibit: exhibitCode(allProjects, allProjects.findIndex((p) => p.slug === project.slug), 'P'),
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
        imageSets: imageSets([project.images?.[0]]),
    };
}

export function projectDetail(project: ProjectProps): ProjectProps {
    return { ...project, imageSets: imageSets(project.images ?? []) };
}

export function origamiCard(piece: OrigamiProps): OrigamiProps {
    return {
        type: 'origami',
        category: piece.category,
        slug: piece.slug,
        exhibit: exhibitCode(allOrigami, allOrigami.findIndex((p) => p.slug === piece.slug), 'O'),
        title: piece.title,
        description: piece.description,
        date: piece.date,
        startDate: piece.startDate,
        designer: piece.designer,
        tags: piece.tags,
        modelImages: piece.modelImages.slice(0, 1),
        imageSets: imageSets([piece.modelImages[0]]),
    };
}

export function origamiDetail(piece: OrigamiProps): OrigamiProps {
    return { ...piece, imageSets: imageSets([...piece.modelImages, piece.creasePattern]) };
}

/** Finds an item plus the one shown as "Next Exhibit". */
export function findExhibit<T extends { slug: string }>(list: T[], slug: string | undefined, prefix: 'P' | 'O') {
    const index = list.findIndex((item) => item.slug === slug);
    if (index === -1) return null;
    const nextIndex = (index - 1 + list.length) % list.length;
    return {
        item: list[index],
        exhibit: exhibitCode(list, index, prefix),
        next: list[nextIndex],
        nextExhibit: exhibitCode(list, nextIndex, prefix),
    };
}
