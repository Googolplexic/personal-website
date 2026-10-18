import type { EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { renderToReadableStream } from 'react-dom/server';

/**
 * Only runs at build time to prerender pages, so it waits for the whole tree
 * (including lazy components) instead of streaming Suspense fallbacks.
 */
export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
) {
    let status = responseStatusCode;
    const body = await renderToReadableStream(
        <ServerRouter context={routerContext} url={request.url} />,
        {
            onError(error: unknown) {
                status = 500;
                console.error(error);
            },
        },
    );
    await body.allReady;

    responseHeaders.set('Content-Type', 'text/html');
    return new Response(body, { headers: responseHeaders, status });
}
