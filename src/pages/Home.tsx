import { About } from '../components/sections/About'
import { Contact } from '../components/sections/Contact'
import { Skills } from '../components/sections/Skills'
import { SEO } from '../components/layout/SEO'
import { ResumeSection } from '../components/sections/ResumeSection'
import { ProjectGrid } from '../components/portfolio/ProjectGrid'
import { Link } from 'react-router-dom'

export function Home() {
    const featuredSlugs = ['hermes', 'personal-website', 'be-square', 'origami-fractions'];

    return (
        <>
            <SEO
                title="Coleman Lai | Software Developer & Origami Artist | Vancouver"
                description="Explore innovative software projects and intricate origami designs by Coleman Lai, a Computing Science student at SFU. View my portfolio now!"
                keywords="Coleman Lai, software developer, computing science, origami artist, SFU, Vancouver, full-stack developer, origami, paper art, portfolio"
            />

            <div className="max-w-5xl mx-auto px-4">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4 dark:text-white">Coleman Lai</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">Developing computing science major and expert origami artist</p>

                    <p>This site is a work-in-progress. More to come<Link to="/admin" className="!no-underline !text-gray-900 dark:!text-gray-100 cursor-default hover:!no-underline hover:!text-gray-900 dark:hover:!text-gray-100">!</Link></p>
                </header >

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-12">
                        <About />
                        <Skills />
                    </div>
                    <div className="space-y-12">
                        <Contact />
                        <ResumeSection />
                    </div>
                </main>

                <section className="mt-16 mb-12">
                    <ProjectGrid
                        featuredSlugs={featuredSlugs}
                        title="Featured Projects"
                        hideControls
                    />
                </section>
            </div>
        </>
    )
}
