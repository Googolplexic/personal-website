import { useEffect, type ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, isRouteErrorResponse } from 'react-router';
import type { Route } from './+types/root';
import { SpotlightProvider } from './components/layout/SpotlightProvider';
import { SiteShell } from './components/layout/SiteShell';
import { NotFound } from './pages/NotFound';
import { printConsoleGreeting } from './utils/consoleGreeting';
import { notFoundMeta, seoMeta } from './utils/seo';
import './index.css';

// Runs before first paint: applies a saved "spotlight off" preference so the
// effects never flash on, and hides the native scrollbar where the custom
// cursor will replace it (conditions match useCustomCursor).
const HEAD_SCRIPT = `try{var c=document.documentElement.classList,m=function(q){return matchMedia(q).matches},r=m('(prefers-reduced-motion: reduce)'),s=localStorage.getItem('spotlight-enabled');if(s==='false'||(s===null&&r))c.add('spotlight-disabled');if(!r&&m('(hover: hover) and (pointer: fine)')&&location.pathname!=='/admin')c.add('custom-scrollbar')}catch(e){}`;

export const links: Route.LinksFunction = () => [
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
    { rel: 'author', href: '/humans.txt' },
    { rel: 'ai-catalog', href: '/.well-known/ai-catalog.json' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Coleman Lai — All updates', href: 'https://www.colemanlai.com/rss.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Coleman Lai — Portfolio', href: 'https://www.colemanlai.com/rss-portfolio.xml' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Coleman Lai — Origami', href: 'https://www.colemanlai.com/rss-origami.xml' },
];

// Every page sets its own tags; these only reach the fallback page used for /admin and 404s.
export const meta: Route.MetaFunction = ({ error }) => isRouteErrorResponse(error) && error.status === 404
    ? notFoundMeta()
    : seoMeta({
        title: 'Coleman Lai',
        description: 'Software projects and origami by Coleman Lai.',
        noindex: true,
    });

export function Layout({ children }: { children: ReactNode }) {
    return (
        // The head script may add a class to <html> before React hydrates
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0a0a0a" />
                <meta name="color-scheme" content="dark" />
                <Meta />
                <Links />
                <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    useEffect(() => {
        const timer = setTimeout(printConsoleGreeting, 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <SpotlightProvider>
            <SiteShell>
                <Outlet />
            </SiteShell>
        </SpotlightProvider>
    );
}

// Shown on the fallback page (/admin and 404s) until the app boots
export function HydrateFallback() {
    return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    const notFound = isRouteErrorResponse(error) && error.status === 404;

    useEffect(() => {
        if (!notFound) console.error(error);
    }, [error, notFound]);

    return (
        <SpotlightProvider>
            <SiteShell>
                {notFound
                    ? <NotFound />
                    : <NotFound overline="Error" title="Something Went Wrong" message="This page hit an error. Try reloading." />}
            </SiteShell>
        </SpotlightProvider>
    );
}
