import { SEO } from '../components/SEO';

export function Origami() {
    return (
        <>
            <SEO 
                title="Origami | Coleman Lai"
                description="Discover intricate origami creations by Coleman Lai. View complex paper art designs and follow my origami journey on Instagram @12googolplex."
                keywords="origami, paper art, Coleman Lai, complex origami, paper folding, origami artist, Vancouver origami, @12googolplex"
                pathname="/origami"
            />
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8">Origami</h1>
                <p>Coming soon...</p>
                <p> Check out my origami for now on{' '}
                    <a href="https://www.instagram.com/12googolplex/" target="_blank" rel="noopener" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Instagram</a>
                </p>
            </div>
        </>
    );
}
