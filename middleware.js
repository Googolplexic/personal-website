/**
 * Rewrites crawler (Discord, Twitter, etc.) requests for /portfolio/:slug and /origami/:slug
 * to the og-page API so they receive HTML with correct og:title, og:description, og:image.
 */

import { next, rewrite } from '@vercel/functions';

const BOT_UA =
  /discord|twitterbot|slackbot|facebookexternalhit|linkedinbot|whatsapp|telegrambot|embed|googlebot|bingbot|baiduspider|yandexbot|duckduckbot|applebot|bot|crawler|spider|preview|embed/i;

export const config = {
  matcher: ['/portfolio/:path*', '/origami/:path*'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return next();

  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname === '/portfolio' || pathname === '/origami') return next();

  const dest = new URL('/api/og-page', request.url);
  dest.searchParams.set('path', pathname);
  return rewrite(dest);
}
