/**
 * Serves build/client the way Vercel does: exact files, then <path>/index.html,
 * then the rewrites in vercel.json, then 404.html with a 404 status.
 * `vite preview` can't stand in, since it answers every path with the home page.
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT = path.join(ROOT, 'build', 'client');
const PORT = Number(process.env.PORT || 4173);

const rewrites = new Map(
  (JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf-8')).rewrites ?? [])
    .map(({ source, destination }) => [source, destination]),
);

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

function resolveFile(pathname) {
  for (const candidate of [pathname, path.posix.join(pathname, 'index.html')]) {
    const file = path.join(CLIENT, candidate);
    if (file.startsWith(CLIENT) && fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

if (!fs.existsSync(path.join(CLIENT, '404.html'))) {
  console.error('preview: build/client/404.html not found; run pnpm build first.');
  process.exit(1);
}

http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = resolveFile(pathname) ?? (rewrites.has(pathname) && resolveFile(rewrites.get(pathname)));
  const status = file ? 200 : 404;
  const body = file || path.join(CLIENT, '404.html');
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(body)] ?? 'application/octet-stream' });
  fs.createReadStream(body).pipe(res);
}).listen(PORT, () => console.log(`Previewing build/client at http://localhost:${PORT}`));
