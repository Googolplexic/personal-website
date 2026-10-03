/**
 * Rewrites crawler requests to the og-page API so they receive HTML with
 * og:title, og:description, and og:image. People still get the SPA.
 */

import { next, rewrite } from '@vercel/functions';

const BOT_UA =
  /discord|twitterbot|slackbot|facebookexternalhit|linkedinbot|whatsapp|telegrambot|embed|googlebot|bingbot|baiduspider|yandexbot|duckduckbot|applebot|bot|crawler|spider|preview|embed/i;

export const config = {
  matcher: ['/', '/portfolio', '/portfolio/:path*', '/origami', '/origami/:path*'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return next();

  const url = new URL(request.url);
  const pathname = url.pathname;

  const dest = new URL('/api/og-page', request.url);
  dest.searchParams.set('path', pathname);
  return rewrite(dest);
}
