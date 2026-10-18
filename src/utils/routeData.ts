import type { ShouldRevalidateFunction } from 'react-router';

/**
 * Loader output is fixed at build time, and query strings on these pages are
 * client-side filters, so a query change shouldn't refetch the route's data.
 */
export const keepDataOnQueryChange: ShouldRevalidateFunction = ({ currentUrl, nextUrl, defaultShouldRevalidate }) =>
    currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
