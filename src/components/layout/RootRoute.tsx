import { useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';

const Home = lazy(() => import('../../pages/Home').then(m => ({ default: m.Home })));

const RICK_ROLL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function isValidUrl(string: string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function RootRoute() {
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('to');
    const targetUrl = redirectUrl && isValidUrl(redirectUrl) ? redirectUrl : RICK_ROLL;

    useEffect(() => {
        if (redirectUrl) {
            const timer = setTimeout(() => {
                window.location.href = targetUrl;
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [redirectUrl, targetUrl]);

    if (redirectUrl) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center">
                <h1 className="gallery-heading text-3xl mb-4"
                    style={{ color: 'var(--color-text-primary)' }}>
                    Loading...
                </h1>
                <div
                    className="mt-4 animate-spin h-8 w-8 rounded-full border-4 border-t-transparent mx-auto"
                    style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
                />
            </div>
        );
    }

    return <Suspense fallback={null}><Home /></Suspense>;
}
