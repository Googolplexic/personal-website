import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap'
import { statSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { getSiteVersionFromGit } from './scripts/site-version-from-git.mjs'

/**
 * Process markdown frontmatter at build time so front-matter/js-yaml
 * never ship to the client. Handles `*.md?parsed` imports returning
 * `{ attributes, body }` as static JSON.
 */
function markdownFrontmatterPlugin(): Plugin {
  return {
    name: 'vite-plugin-md-frontmatter',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.endsWith('?parsed')) return
      const mdPath = source.slice(0, -7)
      if (importer) {
        const importerDir = dirname(importer.replace(/\?.*$/, ''))
        return resolve(importerDir, mdPath) + '?parsed'
      }
    },
    load(id) {
      if (!id.endsWith('?parsed')) return
      const filePath = id.slice(0, -7)
      const raw = readFileSync(filePath, 'utf-8')

      // Minimal frontmatter parser (avoids shipping js-yaml to client)
      const attributes: Record<string, unknown> = {}
      let body = raw
      if (raw.startsWith('---')) {
        const end = raw.indexOf('\n---', 3)
        if (end !== -1) {
          const yamlStr = raw.slice(4, end)
          body = raw.slice(end + 4).replace(/^\n/, '')
          // Simple YAML parser for flat/array values
          let currentKey = ''
          for (const rawLine of yamlStr.split('\n')) {
            const line = rawLine.replace(/\r$/, '')
            const kvMatch = line.match(/^(\w[\w\s]*?):\s*(.*)$/)
            if (kvMatch) {
              currentKey = kvMatch[1].trim()
              const val = kvMatch[2].trim()
              if (val === '') {
                attributes[currentKey] = []
              } else {
                attributes[currentKey] = val
              }
            } else if (line.match(/^-\s+/) && currentKey) {
              const item = line.replace(/^-\s+/, '').trim()
              if (!Array.isArray(attributes[currentKey])) attributes[currentKey] = []
                ; (attributes[currentKey] as string[]).push(item)
            }
          }
        }
      }

      return `export const attributes = ${JSON.stringify(attributes)};\nexport const body = ${JSON.stringify(body)};`
    }
  }
}

/**
 * Serve favicon assets from src during dev and emit them at root during build
 * so /favicon.ico, /favicon.svg, /apple-touch-icon.png, and Android icon URLs
 * always resolve correctly.
 */
function faviconAssetsPlugin(): Plugin {
  const faviconDir = resolve(__dirname, 'src/assets/favicon')
  const faviconFiles = [
    'favicon.ico',
    'favicon.svg',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
  ]

  const requestPathToSource = new Map(
    faviconFiles.map((fileName) => [
      `/${fileName}`,
      resolve(faviconDir, fileName),
    ])
  )

  const getMimeType = (filePath: string) => {
    if (filePath.endsWith('.ico')) return 'image/x-icon'
    if (filePath.endsWith('.svg')) return 'image/svg+xml'
    if (filePath.endsWith('.png')) return 'image/png'
    return 'application/octet-stream'
  }

  return {
    name: 'vite-plugin-favicon-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const requestPath = req.url?.split('?')[0]
        if (!requestPath) return next()

        const sourcePath = requestPathToSource.get(requestPath)
        if (!sourcePath || !existsSync(sourcePath)) return next()

        res.setHeader('Content-Type', getMimeType(sourcePath))
        res.end(readFileSync(sourcePath))
      })
    },
    generateBundle() {
      for (const [requestPath, sourcePath] of requestPathToSource.entries()) {
        if (!existsSync(sourcePath)) continue

        this.emitFile({
          type: 'asset',
          fileName: requestPath.slice(1),
          source: readFileSync(sourcePath),
        })
      }
    },
  }
}

/**
 * Vite plugin to inline CSS <link> tags into <style> blocks in the HTML.
 * Eliminates the render-blocking CSS network request for small bundles.
 */
function inlineCssPlugin(): Plugin {
  return {
    name: 'vite-plugin-inline-css',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html

        // Find all CSS assets in the bundle
        const cssAssets = new Map<string, string>()
        for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
          if (fileName.endsWith('.css') && 'source' in chunk) {
            cssAssets.set(fileName, chunk.source as string)
          }
        }

        // Replace <link rel="stylesheet"> tags with inline <style> blocks
        return html.replace(
          /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']\/([^"']+\.css)["'][^>]*\/?>/gi,
          (match, href) => {
            // Also try the reversed attribute order
            const cssContent = cssAssets.get(href)
            if (cssContent) {
              return `<style>${cssContent}</style>`
            }
            return match
          }
        ).replace(
          /<link\s+[^>]*href=["']\/([^"']+\.css)["'][^>]*rel=["']stylesheet["'][^>]*\/?>/gi,
          (match, href) => {
            const cssContent = cssAssets.get(href)
            if (cssContent) {
              return `<style>${cssContent}</style>`
            }
            return match
          }
        )
      }
    }
  }
}

/**
 * Prune modulepreload hints then inject route-specific preloads for JS chunks
 * AND the LCP image. Eliminates the waterfall where route chunks + images can
 * only start downloading after the entry JS executes.
 */
function routePreloadsPlugin(
  routeFirstImage: Record<string, string>,
  detailFirstImage: Record<string, string> = {},
  portfolioBoot?: { slug: string; title: string; prefix: string },
): Plugin {
  const keepChunks = ['rolldown-runtime', 'vendor-react', 'vendor-router', 'vendor-ui', 'vendor-misc', 'ui-base', 'index']

  const routeChunkPatterns: Record<string, string[]> = {
    '/': ['page-home', 'shared-components', 'project-grid'],
    '/origami': ['page-origami', 'shared-components', 'origami-assets'],
    '/portfolio': ['page-portfolio', 'shared-components', 'project-grid'],
  }

  return {
    name: 'vite-plugin-route-preloads',
    enforce: 'post',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const chunksByPattern: Record<string, string> = {}
      const imagesByPrefix: Record<string, string> = {}

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type === 'chunk') {
          const base = fileName.split('/').pop() || ''
          for (const patterns of Object.values(routeChunkPatterns)) {
            for (const pat of patterns) {
              if (chunksByPattern[pat]) continue
              const isPageOrigami = pat === 'page-origami' && base.startsWith('page-origamidetail')
              const isProjectGrid = pat === 'project-grid' && base.startsWith('project-grid-detection')
              if (!isPageOrigami && !isProjectGrid && base.startsWith(`${pat}-`)) {
                chunksByPattern[pat] = '/' + fileName
              }
            }
          }
        }
        if (asset.type === 'asset' && /\.(webp|jpg|jpeg|png)$/.test(fileName)) {
          for (const prefix of [...Object.values(routeFirstImage), ...Object.values(detailFirstImage)]) {
            if (fileName.includes(prefix) && fileName.includes('.webp') && !imagesByPrefix[prefix]) {
              imagesByPrefix[prefix] = '/' + fileName
            }
          }
        }
      }

      // Build the route mapping as JSON
      const routeMap: Record<string, { js: string[]; img?: string }> = {}
      for (const [route, patterns] of Object.entries(routeChunkPatterns)) {
        routeMap[route] = {
          js: patterns.map(p => chunksByPattern[p]).filter(Boolean)
        }
      }
      for (const [route, prefix] of Object.entries(routeFirstImage)) {
        if (routeMap[route] && imagesByPrefix[prefix]) {
          routeMap[route].img = imagesByPrefix[prefix]
        }
      }
      let projectDetailChunk: string | undefined
      let origamiDetailChunk: string | undefined
      let origamiAssetsChunk: string | undefined
      const projectChunks: Record<string, string> = {}
      for (const fileName of Object.keys(bundle)) {
        if (bundle[fileName].type !== 'chunk') continue
        const base = fileName.split('/').pop() || ''
        if (base.startsWith('page-projectdetail-')) projectDetailChunk = '/' + fileName
        if (base.startsWith('page-origamidetail-')) origamiDetailChunk = '/' + fileName
        if (base.startsWith('origami-assets-')) origamiAssetsChunk = '/' + fileName
        const projectFile = base.match(/^project-(.+)-[A-Za-z0-9_-]{8}\.js$/)
        if (projectFile && projectFile[1] !== 'grid') projectChunks[projectFile[1]] = '/' + fileName
      }
      for (const [route, prefix] of Object.entries(detailFirstImage)) {
        const isOrigami = route.startsWith('/origami/')
        const slug = route.split('/').pop() || ''
        const page = isOrigami ? origamiDetailChunk : projectDetailChunk
        const item = isOrigami ? origamiAssetsChunk : projectChunks[slug]
        routeMap[route] = {
          js: [page, chunksByPattern['shared-components'], item].filter((value): value is string => Boolean(value)),
          img: imagesByPrefix[prefix],
        }
      }

      // Find index.html in the bundle and inject the preload script
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (fileName === 'index.html' && asset.type === 'asset' && typeof asset.source === 'string') {
          let html = asset.source

          // Prune non-critical modulepreloads
          html = html.replace(
            /<link\s+rel="modulepreload"[^>]*href="([^"]*)"[^>]*>/gi,
            (match: string, href: string) => {
              if (keepChunks.some(c => href.includes(c))) return match
              return ''
            }
          )

          // Inject route preload script right before </head>
          const preloadScript = `<script>(function(){var m=${JSON.stringify(routeMap)};var p=location.pathname||"/";if(p.length>1&&p.endsWith("/"))p=p.slice(0,-1);var r=m[p];if(!r)return;var h=document.head;r.js.forEach(function(u){var l=document.createElement('link');l.rel='modulepreload';l.href=u;h.appendChild(l)});if(r.img){var l=document.createElement('link');l.rel='preload';l.as='image';l.href=r.img;l.fetchPriority='high';h.appendChild(l)}})()</script>`
          html = html.replace('</head>', preloadScript + '</head>')

          if (portfolioBoot) {
            let bootSrc = ''
            for (const name of Object.keys(bundle)) {
              if (
                bundle[name].type === 'asset' &&
                name.includes(`/projects/${portfolioBoot.slug}/`) &&
                name.includes(portfolioBoot.prefix) &&
                name.endsWith('.webp')
              ) {
                bootSrc = '/' + name
                break
              }
            }
            const sizeTable = JSON.parse(readFileSync(resolve(__dirname, 'src/utils/imageSizes.json'), 'utf8')) as Record<string, { width: number; height: number }>
            const dim = sizeTable[`${portfolioBoot.slug}/${portfolioBoot.prefix}`]
            if (bootSrc && dim) {
              const alt = portfolioBoot.title.replace(/[&"]/g, (ch) => (ch === '&' ? '&amp;' : '&quot;'))
              html = html.replace(
                '<!--BOOT_PORTFOLIO_IMG-->',
                `<img src="${bootSrc}" alt="${alt}" width="${dim.width}" height="${dim.height}" fetchpriority="high" decoding="sync">`,
              )
              html = html.replace('href="/portfolio/__BOOT_SLUG__"', `href="/portfolio/${portfolioBoot.slug}"`)
            }
          }

          asset.source = html
        }
      }
    }
  }
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Auto-detect projects from the filesystem
const projectsDir = resolve(__dirname, 'src/assets/projects')

const scanProjects = () => {
  try {
    const entries = readdirSync(projectsDir, { withFileTypes: true })
    return entries
      .filter(entry =>
        entry.isDirectory() &&
        entry.name !== 'template' && // Exclude template directory
        existsSync(resolve(projectsDir, entry.name, 'index.ts')) // Must have index.ts
      )
      .map(entry => entry.name)
      .sort()
  } catch (error) {
    console.warn('Error scanning projects:', error)
    return []
  }
}

// Get current projects
const currentProjects = scanProjects()

// Auto-detect origami slugs from my-designs + other-designs
const origamiBaseDir = resolve(__dirname, 'src/assets/origami')
const scanOrigami = (): { slug: string; path: string }[] => {
  const out: { slug: string; path: string }[] = []
  for (const group of ['my-designs', 'other-designs']) {
    const groupPath = resolve(origamiBaseDir, group)
    if (!existsSync(groupPath)) continue
    const entries = readdirSync(groupPath, { withFileTypes: true })
    entries
      .filter(
        (entry) =>
          entry.isDirectory() &&
          entry.name !== 'template' &&
          existsSync(resolve(groupPath, entry.name, 'index.ts'))
      )
      .forEach((entry) => {
        out.push({
          slug: entry.name,
          path: `assets/origami/${group}/${entry.name}`,
        })
      })
  }
  return out
}
const currentOrigami = scanOrigami()

const FRONTMATTER_BLOCK_RE = /^---\r?\n([\s\S]*?)\r?\n---/
const FRONTMATTER_KV_RE = /^(\w+):\s*(.*)$/

const parseFrontmatter = (filePath: string): Record<string, string> => {
  if (!existsSync(filePath)) return {}
  const raw = readFileSync(filePath, 'utf-8')
  const match = raw.match(FRONTMATTER_BLOCK_RE)
  if (!match) return {}

  const out: Record<string, string> = {}
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    const kv = line.match(FRONTMATTER_KV_RE)
    if (!kv) continue
    out[kv[1]] = kv[2].trim()
  }
  return out
}

const parseLooseDate = (value?: string): Date => {
  if (!value) return new Date(0)
  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

const getFirstProjectImagePrefix = (slug: string): string | undefined => {
  const projectPath = resolve(projectsDir, slug)
  for (const subdir of ['images/web', 'images']) {
    const dirPath = resolve(projectPath, subdir)
    if (!existsSync(dirPath)) continue
    const files = readdirSync(dirPath)
      .filter((name) => /\.(png|jpg|jpeg|webp)$/i.test(name))
      .sort()
    if (files.length > 0) return files[0].replace(/\.[^.]+$/, '')
  }
  return undefined
}

const getFirstOrigamiImagePrefix = (slug: string, group: 'my-designs' | 'other-designs'): string | undefined => {
  const basePath = resolve(origamiBaseDir, group, slug)
  for (const subdir of ['web', '.']) {
    const dirPath = subdir === '.' ? basePath : resolve(basePath, subdir)
    if (!existsSync(dirPath)) continue
    const files = readdirSync(dirPath)
      .filter((name) => /\.(png|jpg|jpeg|webp)$/i.test(name) && !name.toLowerCase().includes('pattern'))
      .sort()
    if (files.length > 0) return files[0].replace(/\.[^.]+$/, '')
  }
  return undefined
}

const getPortfolioBoot = (): { slug: string; title: string; prefix: string } | undefined => {
  const rankedProjects = currentProjects
    .map((slug) => {
      const fm = parseFrontmatter(resolve(projectsDir, slug, 'description.md'))
      return {
        slug,
        title: fm.title || slug,
        date: parseLooseDate(fm.startDate),
      }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  for (const project of rankedProjects) {
    const prefix = getFirstProjectImagePrefix(project.slug)
    if (prefix) return { slug: project.slug, title: project.title, prefix }
  }

  return undefined
}

const getOrigamiGalleryFirstImagePrefix = (): string | undefined => {
  const candidates = (currentOrigami.length > 0 ? currentOrigami : [])
    .map((item) => {
      const group: 'my-designs' | 'other-designs' = item.path.includes('/other-designs/') ? 'other-designs' : 'my-designs'
      const fm = parseFrontmatter(resolve(origamiBaseDir, group, item.slug, 'info.md'))
      return {
        slug: item.slug,
        group,
        date: parseLooseDate(fm.date),
      }
    })

  const sorted = candidates
    .filter((item) => item.group === 'my-designs')
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const fallback = candidates
    .filter((item) => item.group === 'other-designs')
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  for (const item of [...sorted, ...fallback]) {
    const prefix = getFirstOrigamiImagePrefix(item.slug, item.group)
    if (prefix) return prefix
  }

  return undefined
}

const routeFirstImage: Record<string, string> = {}
const origamiRouteImagePrefix = getOrigamiGalleryFirstImagePrefix()
if (origamiRouteImagePrefix) routeFirstImage['/origami'] = origamiRouteImagePrefix
const portfolioBoot = getPortfolioBoot()
if (portfolioBoot) routeFirstImage['/portfolio'] = portfolioBoot.prefix

const detailFirstImage: Record<string, string> = {}
for (const slug of currentProjects) {
  const prefix = getFirstProjectImagePrefix(slug)
  if (prefix) detailFirstImage[`/portfolio/${slug}`] = prefix
}
for (const item of currentOrigami) {
  const group: 'my-designs' | 'other-designs' = item.path.includes('/other-designs/') ? 'other-designs' : 'my-designs'
  const prefix = getFirstOrigamiImagePrefix(item.slug, group)
  if (prefix) detailFirstImage[`/origami/${item.slug}`] = prefix
}

// Auto-generate portfolioProjects configuration
const generateProjectConfig = (projectName: string) => {
  // Default configuration
  let priority = 0.6
  let changefreq = 'monthly'

  // Special cases for known projects
  switch (projectName) {
    case 'personal-website':
    case 'data-dave':
    case 'origami-fractions':
      priority = 0.7
      break
    case 'lol-bot':
      priority = 0.1
      changefreq = 'never'
      break
    case 'spirit-of-salmon':
    case 'pdf-merge':
    case 'youtube-speed':
      priority = 0.3
      break
    case 'sfu-scheduler':
    case 'be-square':
      priority = 0.7
      break
    case 'machi-ne':
    case 'box-pleating':
    case 'fold-preview':
      priority = 0.6
      break
  }

  return { priority, changefreq }
}

// Auto-generate portfolioProjects from current projects
const portfolioProjects = Object.fromEntries(
  currentProjects.map(project => [project, generateProjectConfig(project)])
)

console.log(`🚀 Auto-detected ${currentProjects.length} projects:`, currentProjects.join(', '))
console.log(`🎌 Auto-detected ${currentOrigami.length} origami:`, currentOrigami.map((o) => o.slug).join(', '))

const names = [
  'origami',
  ...currentOrigami.map((o) => `origami/${o.slug}`),
  'portfolio',
  ...Object.keys(portfolioProjects).map(name => `portfolio/${name}`)
]
const dynamicRoutes = names.map(name => `/${name}`)

const routePriorities = {
  '/': 1.0,
  '/origami': 0.8,
  '/portfolio': 0.9,
  ...Object.fromEntries(
    currentOrigami.map((o) => [`/origami/${o.slug}`, 0.7])
  ),
  ...Object.fromEntries(
    Object.entries(portfolioProjects).map(([name, data]) =>
      [`/portfolio/${name}`, data.priority]
    )
  )
}

const routeChangeFreq = {
  '/': 'weekly',
  '/origami': 'weekly',
  '/portfolio': 'monthly',
  ...Object.fromEntries(
    currentOrigami.map((o) => [`/origami/${o.slug}`, 'monthly'])
  ),
  ...Object.fromEntries(
    Object.entries(portfolioProjects).map(([name, data]) =>
      [`/portfolio/${name}`, data.changefreq]
    )
  )
}

const cacheFile = resolve(__dirname, 'lastmod-cache.json')

const loadCache = () => {
  if (existsSync(cacheFile)) {
    return JSON.parse(readFileSync(cacheFile, 'utf-8'))
  }
  return {}
}

const saveCache = (cache: Record<string, Date>) => {
  writeFileSync(cacheFile, JSON.stringify(cache, null, 2))
}

const cache = loadCache()

const getLastModTime = (path: string) => {
  const fullPath = resolve(__dirname, "src/" + path)
  try {
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      const files = readdirSync(fullPath)
      const latest = files.reduce((latest: Date, file: string) => {
        try {
          const fileStats = statSync(resolve(fullPath, file))
          return fileStats.mtime > latest ? fileStats.mtime : latest
        } catch (err) {
          console.warn(`Could not stat file ${file} in ${fullPath}:`, err)
          return latest
        }
      }, new Date(0))
      return latest
    }
    return stats.mtime
  } catch (err) {
    console.warn(`Could not stat path ${fullPath}:`, err)
    return new Date() // Return current time as fallback
  }
}

const getUpdatedLastModTime = (path: string) => {
  const currentMtime = getLastModTime(path)
  const cachedMtime = cache[path] ? new Date(cache[path]) : new Date(0)

  // Use the newer of cached vs current modification time
  const finalMtime = currentMtime > cachedMtime ? currentMtime : cachedMtime
  cache[path] = finalMtime
  return finalMtime
}

// Auto-generate route lastmod for all current projects and origami
const routeLastMod = {
  '/': getUpdatedLastModTime('pages/Home.tsx'),
  '/origami': getUpdatedLastModTime('pages/Origami.tsx'),
  '/portfolio': getUpdatedLastModTime('pages/Portfolio.tsx'),
  ...Object.fromEntries(
    currentOrigami.map((o) => [`/origami/${o.slug}`, getUpdatedLastModTime(o.path)])
  ),
  ...Object.fromEntries(
    currentProjects.map(name => {
      const path = `assets/projects/${name}`
      return [`/portfolio/${name}`, getUpdatedLastModTime(path)]
    })
  )
}

// Update cache for any missing projects
for (const project of currentProjects) {
  const cacheKey = `assets/projects/${project}`
  if (!cache[cacheKey]) {
    cache[cacheKey] = getLastModTime(`assets/projects/${project}`)
    console.log(`📝 Added cache entry for new project: ${project}`)
  }
}

// Update cache for any missing origami
for (const o of currentOrigami) {
  if (!cache[o.path]) {
    cache[o.path] = getLastModTime(o.path)
    console.log(`📝 Added cache entry for origami: ${o.slug}`)
  }
}

saveCache(cache)

// Build metadata — inject git info + auto-version for footer display
//
// Version string: shared with package.json via scripts/site-version-from-git.mjs
// (pnpm prebuild / sync-version). Logic: git describe v* --long, else GitHub API.
//
// Versioning uses git tags. To start a new version:
//   1. Commit your changes
//   2. git tag v2.4   (or v3.0, etc.)
//   3. git push --tags
// The third segment auto-increments with each commit after the tag.
// e.g. 3 commits after tag v2.4 → 2.4.3 in the footer + package.json after build

let gitHash = 'dev'
let gitDate = new Date().toISOString().slice(0, 10)
let siteVersion = 'dev'
try {
  const { execSync } = await import('node:child_process')
  gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  gitDate = execSync('git log -1 --format=%cd --date=short', { encoding: 'utf-8' }).trim()
} catch { /* keep hash/date defaults */ }
try {
  siteVersion = await getSiteVersionFromGit()
} catch {
  siteVersion = 'dev'
}

export default defineConfig(({ mode }) => ({
  define: {
    __GIT_HASH__: JSON.stringify(gitHash),
    __GIT_DATE__: JSON.stringify(gitDate),
    __SITE_VERSION__: JSON.stringify(siteVersion),
  },
  plugins: [
    markdownFrontmatterPlugin(),
    faviconAssetsPlugin(),
    tailwindcss(),
    react(),
    inlineCssPlugin(),
    routePreloadsPlugin(routeFirstImage, detailFirstImage, portfolioBoot),
    Sitemap({
      hostname: "https://www.colemanlai.com",
      readable: true,
      dynamicRoutes,
      changefreq: routeChangeFreq,
      priority: routePriorities,
      lastmod: routeLastMod,
    }),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    rolldownOptions: {
      output: {
        hoistTransitiveImports: false,
        assetFileNames: (assetInfo) => {
          // Prefer Rollup 4+ 'names' (array); 'name' is deprecated
          const assetName = (assetInfo as { names?: string[] }).names?.[0] ?? (assetInfo as { name?: string }).name ?? '';
          const info = assetName.split('.');
          const ext = info[info.length - 1] ?? '';
          // Prefer original path (Rollup 4+) so we can group by folder
          const rawPath =
            (typeof (assetInfo as { originalFileNames?: string[] }).originalFileNames !== 'undefined' &&
              (assetInfo as { originalFileNames: string[] }).originalFileNames?.[0]) ||
            (typeof (assetInfo as { originalFileName?: string }).originalFileName !== 'undefined' &&
              (assetInfo as { originalFileName: string }).originalFileName) ||
            assetName;
          const pathNorm = rawPath.replace(/\\/g, '/');

          // Group images by project
          if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
            // Extract project name from path if available
            if (pathNorm.includes('projects/')) {
              const projectMatch = pathNorm.match(/projects\/([^/]+)\//);
              if (projectMatch) {
                return `assets/images/projects/${projectMatch[1]}/[name]-[hash][extname]`;
              }
            }

            // Group origami images by slug (path contains .../origami/.../my-designs/<slug>/ or other-designs/<slug>/)
            if (pathNorm.includes('origami')) {
              const origamiMatch = pathNorm.match(/origami\/[^/]+\/([^/]+)\//);
              if (origamiMatch) {
                return `assets/images/origami/${origamiMatch[1]}/[name]-[hash][extname]`;
              }
              return `assets/images/origami/[name]-[hash][extname]`;
            }

            return `assets/images/[name]-[hash][extname]`;
          }

          // Group other assets by type
          if (['css'].includes(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }

          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: (chunkInfo) => {
          // Create separate chunks for different parts of the app
          if (chunkInfo.name === 'vendor') {
            return 'assets/js/vendor-[hash].js';
          }
          if (chunkInfo.name?.includes('project-')) {
            return 'assets/js/projects/[name]-[hash].js';
          }
          if (chunkInfo.name?.includes('origami')) {
            return 'assets/js/origami/[name]-[hash].js';
          }
          return 'assets/js/[name]-[hash].js';
        },
        // Groups capture their modules' dependencies recursively, so a group
        // must outrank every group whose modules import it. React outranks the
        // markdown stack (which imports react/jsx-runtime), and shared code
        // outranks the page chunks that import it.
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 100 },
            { name: 'vendor-router', test: /[\\/]node_modules[\\/](react-router|cookie|set-cookie-parser)[\\/]/, priority: 90 },
            // Only needed on project detail pages and admin
            { name: 'vendor-content', test: /[\\/]node_modules[\\/](marked|react-markdown|remark-[^\\/]+|micromark[^\\/]*|mdast-[^\\/]+|hast-[^\\/]+|unist-[^\\/]+|unified|vfile[^\\/]*|devlop|bail|trough|is-plain-obj|property-information|space-separated-tokens|comma-separated-tokens|estree-[^\\/]+|longest-streak|ccount|character-[^\\/]+|decode-named-character-reference|parse-entities|trim-lines|is-alphabetical|is-alphanumerical|is-decimal|is-hexadecimal|style-to-[^\\/]+|inline-style-parser|stringify-entities|html-url-attributes|zwitch)[\\/]/, priority: 80 },
            { name: 'vendor-ui', test: /[\\/]node_modules[\\/](react-icons|react-helmet-async|@vercel[\\/][^\\/]+)[\\/]/, priority: 70 },
            { name: 'vendor-lenis', test: /[\\/]node_modules[\\/]lenis[\\/]/, priority: 60 },
            { name: 'vendor-misc', test: /[\\/]node_modules[\\/]/, priority: 50 },
            // Layout, base UI, utils and config load on every page
            { name: 'ui-base', test: /src[\\/](components[\\/](ui[\\/]base|layout)|utils|config)[\\/]/, priority: 40 },
            { name: 'origami-assets', test: /src[\\/]assets[\\/]origami[\\/]/, priority: 30 },
            {
              name: (id) => {
                const match = id.match(/src[\\/]assets[\\/]projects[\\/]([^\\/]+)[\\/]/);
                return match ? `project-${match[1]}` : null;
              },
              priority: 30,
            },
            // Projects barrel + ProjectGrid eagerly import all project data via import.meta.glob
            { name: 'project-grid', test: /src[\\/](assets[\\/]projects[\\/]index\.ts|components[\\/]portfolio[\\/]ProjectGrid)/, priority: 30 },
            { name: 'admin-components', test: /src[\\/]components[\\/]admin[\\/]/, priority: 30 },
            // One chunk for cards, grids, carousels, search and lightbox avoids
            // circular cross-chunk imports between them
            { name: 'shared-components', test: /src[\\/]components[\\/](portfolio|origami|ui|search)[\\/]/, priority: 20 },
            // Listing pages import the detail pages, so detail pages go first
            { name: 'page-projectdetail', test: /src[\\/]pages[\\/]ProjectDetail\.tsx$/, priority: 15 },
            { name: 'page-origamidetail', test: /src[\\/]pages[\\/]OrigamiDetail\.tsx$/, priority: 15 },
            {
              name: (id) => {
                const match = id.match(/src[\\/]pages[\\/]([^\\/]+)\.tsx?$/);
                return match ? `page-${match[1].toLowerCase()}` : null;
              },
              priority: 10,
            },
          ],
        },
      }
    },
    modulePreload: {
      resolveDependencies: (filename, deps) => {
        // vendor-content (react-markdown ecosystem, ~53KB gzip) is only needed
        // by ProjectDetail and AdminPage. Remove it from all other routes'
        // modulepreload lists to avoid downloading + parsing 176KB of JS.
        const needsMarkdown = filename.includes('page-projectdetail') ||
          filename.includes('admin-components') ||
          filename.includes('page-adminpage');
        return deps.filter(dep => {
          if (dep.includes('vendor-content')) return needsMarkdown;
          return true;
        });
      }
    },
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 500,
  },
  assetsInclude: ['**/*.md'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router'], // Ensure React is pre-bundled
  }
}))
