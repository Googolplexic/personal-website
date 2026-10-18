import { Link } from '../ui/base';
import { SectionHeader } from '../ui/SectionHeader';

export function About() {
    return (
        <div className="page-grid">
            <SectionHeader overline="An Introduction" title="About" />
            <div className="col-span-full lg:col-span-9 flex flex-col gap-5 *:max-w-prose">
                <p className="m-0 text-base md:text-lg leading-relaxed font-body text-ink-muted">
                    Hi there! I'm Coleman, a Computing Science student at Simon Fraser University. I love solving problems, whether it's for coding, math, or just general life: always looking for ways to optimize, automate, or simplify things. The ultimate goal is to build intuitive user interfaces and efficient solutions that make life easier, for both me and you.
                </p>
                <p className="m-0 text-base md:text-lg leading-relaxed font-body text-ink-muted">
                    This site showcases my software development projects and all of my origami work. Thematically, I wanted this site to appear like a gallery or a theatre, hence the spotlight effects and the dark and gold colour scheme. (If you don't see spotlights, try taking a look on desktop! There's a bit more cool stuff there). Take a look at my projects on{' '}
                    <Link href="https://github.com/Googolplexic" target="_blank" rel="noopener">
                        GitHub
                    </Link>
                    {' '}or browse my{' '}
                    <Link to="/portfolio">
                        software portfolio
                    </Link>. Any feedback is welcome!
                </p>
                <p className="m-0 text-base md:text-lg leading-relaxed font-body text-ink-muted">
                    Beyond coding and academic work, I design and fold{' '}
                    <Link to="/origami">
                        origami models
                    </Link>
                    {' '}in my free time, a hobby that I've been doing for over 12 years (or maybe more, I've lost count). Mostly I fold models from other great origami artists around the internet, but I've also been designing my own models for the past few years. Thank you for taking the time to visit, and I hope you enjoy the work!
                </p>
            </div>
        </div>
    );
}
