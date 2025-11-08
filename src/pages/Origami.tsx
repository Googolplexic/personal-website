import { SEO } from '../components/layout/SEO';
import { GroupedItemGrid } from '../components/ui/GroupedItemGrid';
import { myDesigns, otherDesigns } from '../assets/origami';
import projects from '../assets/projects';
import { ItemProps } from '../types';
import { Heading, Text, Link } from '../components/ui/base';
import { container, spacing } from '../utils/styles';

export function Origami() {
    const origamiProjects = ['fold-preview', 'box-pleating', 'origami-fractions'];
    const featuredProjects = projects.filter(project => origamiProjects.includes(project.slug));

    // Combine all items for unified search
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
            <div className={container('lg')}>
                <Heading level={1}>Origami</Heading>
                <Text>
                    More images are coming soon! In the meantime, please visit{' '}
                    <Link
                        href="https://www.instagram.com/12googolplex"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-300"
                    >
                        @12googolplex
                    </Link>
                </Text>
                <Text className={spacing({ mb: '8' })}>
                    These image albums are all dynamically generated! See my{' '}
                    <Link href="https://www.colemanlai.com/portfolio/personal-website" target="_blank" rel="noopener">
                        personal website
                    </Link>
                    {' '}page for more detail.
                </Text>

                {/* Unified search with grouping across all origami content */}
                <div className={container('md')}>
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
            </div>
        </>
    );
}
