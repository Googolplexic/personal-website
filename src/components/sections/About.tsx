import { Link } from '../ui/base';

export function About() {
    return (
        <div id="about">
            <p className="gallery-overline mb-6">An Introduction</p>
            <div className="space-y-5">
                <p className="text-base md:text-lg leading-relaxed font-body"
                   style={{ color: 'var(--color-text-secondary)' }}>
                    Hi there, welcome to my gallery! I'm a third-year Computing Science student at Simon Fraser University, passionate about building intuitive user interfaces and efficient solutions.
                </p>
                <p className="text-base md:text-lg leading-relaxed font-body"
                   style={{ color: 'var(--color-text-secondary)' }}>
                    This site showcases some of my software development projects and other creative work. Take a look at my projects on{' '}
                    <Link href="https://github.com/Googolplexic" target="_blank" rel="noopener">
                        GitHub
                    </Link>
                    {' '}or in my{' '}
                    <Link to="/portfolio" onClick={() => window.scrollTo(0, 0)}>
                        portfolio
                    </Link>.
                </p>
                <p className="text-base md:text-lg leading-relaxed font-body"
                   style={{ color: 'var(--color-text-secondary)' }}>
                    Beyond coding, I design and fold{' '}
                    <Link to="/origami" onClick={() => window.scrollTo(0, 0)}>
                        origami models
                    </Link>
                    {' '}in my free time. Come check my work out! The site's still a work in progress, so any feedback is welcome!
                </p>
            </div>
        </div>
    );
}
