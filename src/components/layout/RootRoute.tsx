import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home } from '../../pages/Home';
import { Heading } from '../ui/base/Heading';

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
            <div className="text-center">
                <Heading level={1} className="mb-4">Loading...</Heading>
                <div className="mt-4 animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
            </div>
        );
    }

    return <Home />;
}
