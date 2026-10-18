/**
 * Serves build/client the way Vercel does: exact files, then <path>/index.html,
 * then the rewrites in vercel.json, then 404.html with a 404 status. Sends the
 * headers from vercel.json and compresses text, so CSP problems and transfer
 * sizes show up locally. `vite preview` can't stand in, since it answers every
 * path with the home page.
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT = path.join(ROOT, 'build', 'client');
const PORT = Number(process.env.PORT || 4173);

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf-8'));
const rewrites = new Map((vercel.rewrites ?? []).map(({ source, destination }) => [source, destination]));
// Over plain HTTP, upgrade-insecure-requests would send every asset request to https://localhost
const headerRules = (vercel.headers ?? []).map(({ source, headers }) => ({
  pattern: new RegExp(`^${source}$`),
  headers: headers.map(({ key, value }) => [key, value.replace(/;\s*upgrade-insecure-requests/, '')]),
}));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

function resolveFile(pathname) {
  for (const candidate of [pathname, path.posix.join(pathname, 'index.html')]) {
    const file = path.join(CLIENT, candidate);
    if (file.startsWith(CLIENT) && fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

function encoder(acceptEncoding = '') {
  if (/\bbr\b/.test(acceptEncoding)) return ['br', zlib.createBrotliCompress()];
  if (/\bgzip\b/.test(acceptEncoding)) return ['gzip', zlib.createGzip()];
  return [null, null];
}

if (!fs.existsSync(path.join(CLIENT, '404.html'))) {
  console.error('preview: build/client/404.html not found; run pnpm build first.');
  process.exit(1);
}

http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const headers = Object.fromEntries(headerRules.filter(({ pattern }) => pattern.test(pathname)).flatMap(rule => rule.headers));

  // Vercel serves its analytics scripts itself; answer with an empty one so the console stays clean
  if (pathname.startsWith('/_vercel/')) {
    res.writeHead(200, { ...headers, 'Content-Type': 'text/javascript' });
    res.end();
    return;
  }

  const file = resolveFile(pathname) ?? (rewrites.has(pathname) && resolveFile(rewrites.get(pathname)));
  const body = file || path.join(CLIENT, '404.html');
  const type = TYPES[path.extname(body)] ?? 'application/octet-stream';
  const [encoding, compress] = COMPRESSIBLE.test(type) ? encoder(req.headers['accept-encoding']) : [null, null];
  res.writeHead(file ? 200 : 404, {
    ...headers,
    'Content-Type': type,
    ...(encoding && { 'Content-Encoding': encoding, Vary: 'Accept-Encoding' }),
  });
  // A rebuild can delete files mid-request; end the response instead of crashing
  const stream = fs.createReadStream(body).on('error', () => res.end());
  (compress ? stream.pipe(compress) : stream).pipe(res);
}).listen(PORT, () => console.log(`Previewing build/client at http://localhost:${PORT}`));
