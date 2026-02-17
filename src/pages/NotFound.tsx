import { SEO } from '../components/layout/SEO';
import { Link as RouterLink } from 'react-router-dom';

export function NotFound() {
    return (
        <>
            <SEO
                title="Page Not Found | 404 Error | Coleman Lai"
                description="Sorry, the page you're looking for doesn't exist. Return to Coleman Lai's homepage to explore software projects and origami creations."
                type="website"
                children={
                    <meta name="robots" content="noindex, follow" />
                }
            />

            <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
                <p className="gallery-overline mb-4">Error 404</p>
                <h1 className="gallery-heading text-5xl md:text-6xl mb-4"
                    style={{ color: 'var(--color-text-primary)' }}>
                    Page Not Found
                </h1>
                <p className="font-body text-lg mb-10" style={{ color: 'var(--color-text-secondary)' }}>
                    The page you're looking for doesn't exist.
                </p>
                <RouterLink
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 font-body text-xs tracking-[0.15em] uppercase no-underline transition-colors duration-300"
                    style={{
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-text-tertiary)'
                    }}
                >
                    Return to Gallery
                </RouterLink>
            </div>
        </>
    );
}
