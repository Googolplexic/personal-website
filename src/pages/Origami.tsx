import { SEO } from '../components/SEO';
import { OrigamiModel } from '../components/OrigamiModel';
import { myDesigns, otherDesigns } from '../utils/albums';
import { ProjectGrid } from '../components/ProjectGrid';

export function Origami() {
    const origamiProjects = ['fold-preview', 'box-pleating', 'origami-fractions'];

    console.log('My Designs Albums:', myDesigns.albums); 
    console.log('Other Designs Albums:', otherDesigns.albums);

    return (
        <>
            <SEO
                title="Origami | Coleman Lai"
                description="Discover intricate origami creations by Coleman Lai. View complex paper art designs and follow my origami journey."
                keywords="origami, paper art, Coleman Lai, complex origami, paper folding, origami artist, Vancouver origami"
                pathname="/origami"
            />
            <div className="max-w-6xl mx-auto px-4">
                <h1>Origami</h1>
                <p>
                    More images are coming soon! In the meantime, please visit{' '}
                    <a
                        href="https://www.instagram.com/12googolplex"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-300"
                    >
                        @12googolplex
                    </a>
                </p>
                <p className='mb-8'>
                    These image albums are all dynamically generated! See my{' '}
                    <a href="https://www.colemanlai.com/portfolio/personal-website" target="_blank" rel="noopener">personal website</a> page for more detail.

                </p>
                <div className="space-y-16">
                    <section>
                        <h2>My Designs</h2>
                        {/* Make my designs take full width */}
                        <div className="max-w-5xl mx-auto">
                            {myDesigns.albums.map((album) => (
                                <OrigamiModel
                                    key={album.title}
                                    title={album.title}
                                    description={album.description}
                                    modelImages={album.modelImages}
                                    creasePattern={album.creasePattern}
                                    date={album.date} 
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2>Models Designed by Other Artists</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {otherDesigns.albums.map((album) => (
                                <OrigamiModel
                                    key={album.title}
                                    title={album.title}
                                    description={album.description}
                                    modelImages={album.modelImages}
                                    date={album.date}
                                    designer={album.designer}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="max-w-5xl mx-auto">
                            <ProjectGrid
                                featuredSlugs={origamiProjects}
                                title="Origami Software"
                                hideControls
                            />
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
