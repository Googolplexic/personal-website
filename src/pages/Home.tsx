import { About } from '../components/About'
import { Contact } from '../components/Contact'
import { Skills } from '../components/Skills'

export function Home() {
    return (
        <>
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4 dark:text-white">Coleman Lai</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">Not a Full Stack Developer</p>
            </header>

            <main>
                <About />
                <Skills />
                <Contact />
            </main>
        </>
    )
}
