import { useEffect } from 'react';

const RICK_ROLL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function isValidUrl(string: string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/** Handles `/?to=<url>`: a short loading screen, then off-site. */
export function ExternalRedirect({ to }: { to: string }) {
    const targetUrl = isValidUrl(to) ? to : RICK_ROLL;

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
