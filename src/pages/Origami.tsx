import { SEO } from '../components/SEO';
import { Carousel } from '../components/Carousel';
import { myDesigns, otherDesigns } from '../utils/albums';
import { ProjectGrid } from '../components/ProjectGrid';

export function Origami() {
    const origamiProjects = ['fold-preview', 'box-pleating', 'origami-fractions'];

    console.log('My Designs Albums:', myDesigns.albums); // Debug log

    return (
        <>
            <SEO
                title="Origami | Coleman Lai"
                description="Discover intricate origami creations by Coleman Lai. View complex paper art designs and follow my origami journey."
                keywords="origami, paper art, Coleman Lai, complex origami, paper folding, origami artist, Vancouver origami"
                pathname="/origami"
            />
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="">Origami</h1>
                Images are coming soon! In the meantime, please visit{' '}
                <a
                    href="https://www.instagram.com/12googolplex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-300"
                >
                    @12googolplex
                </a>
                <br /><br />
                <div className="space-y-16">
                    <section>
                        <h2>My Designs</h2>
                        {/* Make my designs take full width */}
                        <div className="max-w-5xl mx-auto">
                            {myDesigns.albums.map((album) => (
                                <Carousel
                                    key={album.title}
                                    modelImages={album.modelImages}
                                    title={album.title}
                                    creasePattern={album.creasePattern}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2>Other Artists' Work</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {otherDesigns.albums.map((album) => (
                                <Carousel
                                    key={album.title}
                                    modelImages={album.modelImages}
                                    title={album.title}
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
