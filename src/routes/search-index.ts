import { allOrigami, allProjects } from '../content.server';
import type { SearchEntry } from '../components/command/searchIndex';

/** Every piece in a few words each, prerendered to /search-index.json for the command menu. */
export function loader() {
    const entries: SearchEntry[] = [
        ...allProjects.map((project): SearchEntry => ({
            title: project.title,
            path: `/portfolio/${project.slug}`,
            section: 'Portfolio',
            detail: project.technologies.slice(0, 3).join(' · '),
            keywords: [project.summary, ...project.technologies, ...(project.tags ?? [])].join(' '),
        })),
        ...allOrigami.map((piece): SearchEntry => ({
            title: piece.title,
            path: `/origami/${piece.slug}`,
            section: 'Origami',
            detail: [piece.designer, piece.date].filter(Boolean).join(' · '),
            keywords: [piece.description, piece.designer, piece.category === 'my-designs' ? 'my design original' : '', ...(piece.tags ?? [])].filter(Boolean).join(' '),
        })),
    ];
    return Response.json(entries);
}
