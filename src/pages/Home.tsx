import { About } from '../components/About'
import { Contact } from '../components/Contact'
import { Skills } from '../components/Skills'
import { SEO } from '../components/SEO'

export function Home() {
    return (
        <>
            <SEO 
                title="Coleman Lai | Software Developer & Origami Artist | Vancouver"
                description="Explore innovative software projects and intricate origami designs by Coleman Lai, a Computing Science student at SFU. View my portfolio now!"
                keywords="Coleman Lai, software developer, computing science, origami artist, SFU, Vancouver, full-stack developer, origami, paper art, portfolio"
            />

            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4 dark:text-white">Coleman Lai</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">Developing computing science major and expert origami artist</p>
                <br />
                <hr />
                <br />
                <p>This site is a work-in-progress. More to come!</p>
            </header >

            <main>
                <About />
                <Skills />
                <Contact />
            </main>
        </>
    )
}
