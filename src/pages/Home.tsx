import { About } from '../components/sections/About';
import { Contact } from '../components/sections/Contact';
import { Skills } from '../components/sections/Skills';
import { SEO } from '../components/layout/SEO';
import { ResumeSection } from '../components/sections/ResumeSection';
import { ProjectGrid } from '../components/portfolio/ProjectGrid';
import { Heading, Text, Link, Stack } from '../components/ui/base';
import { container, grid, spacing, themeClasses } from '../utils/styles';

export function Home() {
    const featuredSlugs = ['hermes', 'personal-website', 'be-square', 'origami-fractions'];

    return (
        <>
            <SEO
                title="Coleman Lai | Software Developer & Origami Artist | Vancouver"
                description="Explore innovative software projects and intricate origami designs by Coleman Lai, a Computing Science student at SFU. View my portfolio now!"
                keywords="Coleman Lai, software developer, computing science, origami artist, SFU, Vancouver, full-stack developer, origami, paper art, portfolio"
            />

            <div className={container('md')}>
                <header className={`${spacing({ mb: '12' })} text-center`}>
                    <Heading level={1} className={spacing({ mb: '4' })}>Coleman Lai</Heading>
                    <Text size="xl" color="secondary" className={spacing({ mb: '4' })}>
                        Developing computing science major and expert origami artist
                    </Text>
                    <Text>
                        This site is a work-in-progress. More to come
                        <Link to="/admin" className={`!no-underline ${themeClasses('!text-gray-900', '!text-gray-100')} cursor-default ${themeClasses('hover:!text-gray-900', 'hover:!text-gray-100')}`}>
                            !
                        </Link>
                    </Text>
                </header>

                <main className={grid('2', '12')}>
                    <Stack spacing="12">
                        <About />
                        <Skills />
                    </Stack>
                    <Stack spacing="12">
                        <Contact />
                        <ResumeSection />
                    </Stack>
                </main>

                <section className={`${spacing({ mt: '16', mb: '12' })}`}>
                    <ProjectGrid
                        featuredSlugs={featuredSlugs}
                        title="Featured Projects"
                        hideControls
                    />
                </section>
            </div>
        </>
    );
}
