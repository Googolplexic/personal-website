import { SEO } from '../components/layout/SEO';
import { GroupedItemGrid } from '../components/ui/GroupedItemGrid';
import { myDesigns, otherDesigns } from '../assets/origami';
import projects from '../assets/projects';
import { ItemProps } from '../types';

export function Origami() {
    const origamiProjects = ['fold-preview', 'box-pleating', 'origami-fractions'];
    const featuredProjects = projects.filter(project => origamiProjects.includes(project.slug));

    const allItems: ItemProps[] = [
        ...myDesigns,
        ...otherDesigns,
        ...featuredProjects
    ];

    return (
        <>
            <SEO
                title="Origami | Coleman Lai"
                description="Discover intricate origami creations by Coleman Lai. View complex paper art designs and follow my origami journey."
                keywords="origami, paper art, Coleman Lai, complex origami, paper folding, origami artist, Vancouver origami"
                pathname="/origami"
            />
            <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                <div className="text-center mb-14">
                    <p className="gallery-overline mb-4">Paper & Form</p>
                    <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4"
                        style={{ color: 'var(--color-text-primary)' }}>
                        Origami
                    </h1>
                    <p className="text-base font-body max-w-lg mx-auto mb-2"
                       style={{ color: 'var(--color-text-secondary)' }}>
                        A study of light, shadow, and geometric precision.
                    </p>
                    <p className="text-sm font-body"
                       style={{ color: 'var(--color-text-tertiary)' }}>
                        More on{' '}
                        <a
                            href="https://www.instagram.com/12googolplex"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-accent-text)' }}
                        >
                            @12googolplex
                        </a>
                    </p>
                </div>

                <GroupedItemGrid
                    items={allItems}
                    title="Browse All Origami & Software"
                    itemType="mixed"
                    showGrouping={true}
                    allowGroupingToggle={true}
                    myDesigns={myDesigns}
                    otherDesigns={otherDesigns}
                    software={featuredProjects}
                />
            </div>
        </>
    );
}
