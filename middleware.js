/**
 * Rewrites link-preview unfurlers to the og-page API so they receive HTML with
 * og:title, og:description, and og:image. People and search crawlers get the SPA.
 *
 * Search crawlers (Googlebot, Bingbot, and anything else matching a generic
 * "bot") must not be rewritten. og-page is a title stub whose body is only
 * "Redirecting...", so sending them there keeps project and origami pages
 * out of the index.
 */

import { next, rewrite } from '@vercel/functions';

const PREVIEW_UA =
  /discordbot|twitterbot|facebookexternalhit|facebot|linkedinbot|slackbot|whatsapp|telegrambot|pinterestbot|redditbot|embedly|quora link preview|vkshare|skypeuripreview/i;

export const config = {
  matcher: ['/', '/portfolio', '/portfolio/:path*', '/origami', '/origami/:path*'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!PREVIEW_UA.test(ua)) return next();

  const url = new URL(request.url);
  const pathname = url.pathname;

  const dest = new URL('/api/og-page', request.url);
  dest.searchParams.set('path', pathname);
  return rewrite(dest);
}
