/**
 * Runs after `react-router build`:
 * - copies the SPA fallback to 404.html, which Vercel serves (with a 404
 *   status) for any path that wasn't prerendered; the client router then
 *   renders the right page or the 404 page
 * - inlines the stylesheet so pages paint without waiting on a CSS request;
 *   the <link> stays (React hydrates against it) but loads without blocking
 * - adds the source-view crane to every HTML page (React can't render comments)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT = path.join(ROOT, 'build', 'client');
const SPA_FALLBACK = path.join(CLIENT, '__spa-fallback.html');

const CRANE = `<!--
                       |
                       ||
                       ||,
                       |'\\
                        |\`|
                        | \`|
                        '| |.
                         | \`L
                         |  |,
                         \`|  |.                              _,/7
                          |  \`|                       __,---'' /
                          |   \`|              __,---'"   ..- ./
                          ||   |      _.--=/'',--=-,,  -    ,/
                          \`|   \\,/'''\`\\,     /'   >  \\     /'
                           | ,/'  \`. .  \`\\ ,/'   / \\  \\   /'
                   ___,----Y-'      Y     7'   .'.' \`\\ \\ /'
               _-/''        \`\\.     .   ,/'    /.'    \`\\\\ 
           _,-''          ---  \\    \`  /'    ./.'   __-' "
        _/''     .--            \`\\    /'     /,'_--'
     ,/''  ..                     \`"\\_     ./ /
 .,/'                             .--"\\    / / 
<------------------,_____      ,/~'  \\ | ./ .'
                        \`"""""""      \`|_/\\ /
                                        '  '

    My gallery of code and paper.
    https://www.colemanlai.com

    Curious? See /humans.txt
    Found a vulnerability? See /.well-known/security.txt

-->`;

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

if (!fs.existsSync(SPA_FALLBACK)) {
  console.error('finalize-build: build/client/__spa-fallback.html not found; run react-router build first.');
  process.exit(1);
}

fs.copyFileSync(SPA_FALLBACK, path.join(CLIENT, '404.html'));

const STYLESHEET = /<link rel="stylesheet" href="(\/assets\/css\/[^"]+\.css)"\/>/g;
const stylesheets = new Map();
function inlineStylesheets(html) {
  return html.replace(STYLESHEET, (_, href) => {
    if (!stylesheets.has(href)) stylesheets.set(href, fs.readFileSync(path.join(CLIENT, href), 'utf-8'));
    return `<style>${stylesheets.get(href)}</style><link rel="stylesheet" href="${href}" media="print" onload="this.media='all'"/>`;
  });
}

const pages = htmlFiles(CLIENT);
for (const file of pages) {
  let html = inlineStylesheets(fs.readFileSync(file, 'utf-8'));
  if (!html.includes('My gallery of code and paper.\n    https://')) html = html.replace('</body>', `${CRANE}\n</body>`);
  fs.writeFileSync(file, html, 'utf-8');
}

console.log(`finalize-build: wrote 404.html, inlined CSS and added the crane on ${pages.length} pages`);
