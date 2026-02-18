import { Link } from '../ui/base';

export function About() {
    return (
        <div id="about">
            <p className="gallery-overline mb-6">An Introduction</p>
            <div className="space-y-5">
                <p className="text-base md:text-lg leading-relaxed font-body"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    Hi there! I'm Coleman, a third-year Computing Science student at Simon Fraser University. I love solving problems, whether it's for coding, math, or just general life: always looking for ways to optimize, automate, or simplify things. The ultimate goal is to build intuitive user interfaces and efficient solutions that make life easier, for both me and you.
                </p>
                <p className="text-base md:text-lg leading-relaxed font-body"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    This site showcases my software development projects and all of my origami work. Thematically, I wanted this site to appear like an gallery or a theatre, hence the spotlight effects and the dark and gold colour scheme. (If you don't see spotlights, try taking a look on desktop!). Take a look at my projects on{' '}
                    <Link href="https://github.com/Googolplexic" target="_blank" rel="noopener">
                        GitHub
                    </Link>
                    {' '}or in my{' '}
                    <Link to="/portfolio" onClick={() => window.scrollTo(0, 0)}>
                        portfolio
                    </Link>.  The site's still a work in progress, so any feedback is welcome!
                </p>
                <p className="text-base md:text-lg leading-relaxed font-body"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    Beyond coding and academic work, I design and fold{' '}
                    <Link to="/origami" onClick={() => window.scrollTo(0, 0)}>
                        origami models
                    </Link>
                    {' '}in my free time, a hobby that I've been doing for over 12 years now! Thank you for taking the time to look at my site, and I hope you enjoy my work!
                </p>
            </div>
        </div>
    );
}
