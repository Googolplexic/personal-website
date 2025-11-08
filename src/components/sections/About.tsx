import { Heading, Text, Link, Stack } from '../ui/base';

export function About() {
    return (
        <section id="about" className="mb-12">
            <Heading level={2}>About Me</Heading>
            <Stack spacing="4">
                <Text>
                    Hi! I'm a third-year Computing Science student at Simon Fraser University, passionate about building intuitive user interfaces and efficient solutions.
                </Text>
                <Text>
                    This site showcases some of my software development projects and other creative work. I'm passionate about building intuitive user interfaces and solving complex problems through clean, efficient code.
                    Take a look at my projects on{' '}
                    <Link href="https://github.com/Googolplexic" target="_blank" rel="noopener">
                        GitHub
                    </Link>
                    {' '}or in my{' '}
                    <Link to="/portfolio" onClick={() => window.scrollTo(0, 0)}>
                        portfolio
                    </Link>.
                </Text>
                <Text>
                    Beyond coding, I design and fold{' '}
                    <Link to="/origami" onClick={() => window.scrollTo(0, 0)}>
                        origami models
                    </Link>
                    {' '}in my free time. Come check my work out!
                </Text>
            </Stack>
        </section>
    );
}
