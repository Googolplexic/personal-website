import { useEffect } from 'react';
import { redirectTarget } from '../../utils/redirect';

/** Handles `/?to=<url>`: a short loading screen, then off-site. */
export function ExternalRedirect({ to }: { to: string }) {
    const targetUrl = redirectTarget(to);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = targetUrl;
        }, 2000);
        return () => clearTimeout(timer);
    }, [targetUrl]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="gallery-heading text-3xl mb-4 text-ink">
                Loading...
            </h1>
            <div
                className="mt-4 animate-spin h-8 w-8 rounded-full border-4 border-t-transparent mx-auto"
                style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
            />
        </div>
    );
}
