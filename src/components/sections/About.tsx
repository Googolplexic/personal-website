import { Link } from "react-router";

export function About() {
    return (
        <section id="about" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">About Me</h2>
            <div className="space-y-4">
                <p>
                    Hi! I'm a second-year Computing Science student at Simon Fraser University, passionate about building intuitive user interfaces and efficient solutions.
                </p>
                <p> This site showcases some of my software development projects and other creative work. I'm passionate about building intuitive user interfaces and solving complex problems through clean, efficient code.
                    Take a look at my projects on {' '}

                    <a href="https://github.com/Googolplexic" target="_blank" rel="noopener">GitHub</a>

                    {' '}or in my{' '}

                    <Link to="/portfolio" onClick={() => window.scrollTo(0, 0)}>portfolio</Link>.
                </p>
                <p>
                    Beyond coding, I design and fold{' '}
                    <Link to="/origami" onClick={() => window.scrollTo(0, 0)}>origami models</Link>
                    {' '}in my free time. Come check my work out!
                </p>
            </div>
        </section>
    )
}
