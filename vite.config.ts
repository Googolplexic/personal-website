import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { statSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

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
          for (const line of yamlStr.split('\n')) {
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
              ;(attributes[currentKey] as string[]).push(item)
            }
          }
        }
      }

      return `export const attributes = ${JSON.stringify(attributes)};\nexport const body = ${JSON.stringify(body)};`
    }
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
 * Break circular vendor-react <-> vendor-content dependency by inlining the
 * getDefaultExportFromCjs helper. Without this, loading vendor-react forces
 * vendor-content (53 KB gzip of react-markdown) to load on every page.
 */
function breakVendorCyclePlugin(): Plugin {
  const HELPER = 'function(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}';
  return {
    name: 'vite-plugin-break-vendor-cycle',
    enforce: 'post',
    apply: 'build',
    generateBundle(_opts, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk' || !fileName.includes('vendor-react')) continue
        const importRe = /import\{(\w+) as (\w+)\}from"\.\/vendor-content[^"]*\.js";?/
        const m = chunk.code.match(importRe)
        if (!m) continue
        const alias = m[2]
        chunk.code = chunk.code
          .replace(importRe, `var ${alias}=${HELPER};`)
      }
    }
  }
}

/**
 * Prune modulepreload hints then inject route-specific preloads for JS chunks
 * AND the LCP image. Eliminates the waterfall where route chunks + images can
 * only start downloading after the entry JS executes.
 */
function routePreloadsPlugin(): Plugin {
  const keepChunks = ['vendor-react', 'vendor-ui', 'vendor-misc', 'utils', 'ui-base', 'index']

  const routeChunkPatterns: Record<string, string[]> = {
    '/': ['page-home', 'shared-components', 'project-grid'],
    '/origami': ['page-origami', 'shared-components', 'origami-assets'],
    '/portfolio': ['page-portfolio', 'shared-components', 'project-grid'],
  }

  // First image filename prefixes per route (matched against emitted assets)
  const routeFirstImage: Record<string, string> = {
    '/origami': '01-tonberry',
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
          for (const patterns of Object.values(routeChunkPatterns)) {
            for (const pat of patterns) {
              if (fileName.includes(pat) && !chunksByPattern[pat]) {
                chunksByPattern[pat] = '/' + fileName
              }
            }
          }
        }
        if (asset.type === 'asset' && /\.(webp|jpg|jpeg|png)$/.test(fileName)) {
          for (const prefix of Object.values(routeFirstImage)) {
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
          const preloadScript = `<script>(function(){var m=${JSON.stringify(routeMap)};var p=location.pathname;var r=m[p];if(!r)return;var h=document.head;r.js.forEach(function(u){var l=document.createElement('link');l.rel='modulepreload';l.href=u;h.appendChild(l)});if(r.img){var l=document.createElement('link');l.rel='preload';l.as='image';l.href=r.img;h.appendChild(l)}})()</script>`
          html = html.replace('</head>', preloadScript + '</head>')

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

const names = [
  'origami',
  'portfolio',
  ...Object.keys(portfolioProjects).map(name => `portfolio/${name}`)
]
const dynamicRoutes = names.map(name => `/${name}`)

const routePriorities = {
  '/': 1.0,
  '/origami': 0.8,
  '/portfolio': 0.9,
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

// Auto-generate route lastmod for all current projects
const routeLastMod = {
  '/': getUpdatedLastModTime('pages/Home.tsx'),
  '/origami': getUpdatedLastModTime('pages/Origami.tsx'),
  '/portfolio': getUpdatedLastModTime('pages/Portfolio.tsx'),
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

saveCache(cache)

export default defineConfig(({ mode }) => ({
  plugins: [
    markdownFrontmatterPlugin(),
    react(),
    inlineCssPlugin(),
    breakVendorCyclePlugin(),
    routePreloadsPlugin(),
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
    rollupOptions: {
      output: {
        hoistTransitiveImports: false,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];

          // Group images by project
          if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
            const name = assetInfo.name || '';

            // Extract project name from path if available
            if (name.includes('projects/')) {
              const projectMatch = name.match(/projects\/([^/]+)\//);
              if (projectMatch) {
                return `assets/images/projects/${projectMatch[1]}/[name]-[hash][extname]`;
              }
            }

            // Other images (origami, etc.)
            if (name.includes('origami/')) {
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
        manualChunks: (id) => {
          // Vendor libraries — ordering matters! More specific checks first
          // to prevent broad patterns (e.g. 'react') from swallowing
          // react-markdown, react-icons, react-helmet-async, etc.
          if (id.includes('node_modules')) {
            // Markdown rendering (react-markdown + remark/rehype/unified ecosystem)
            // Only needed on project detail pages that render markdown
            if (
              id.includes('marked') || id.includes('react-markdown') ||
              id.includes('hast') || id.includes('mdast') || id.includes('unist') ||
              id.includes('micromark') || id.includes('remark') || id.includes('rehype') ||
              id.includes('unified') ||
              id.includes('vfile') || id.includes('property-information') ||
              id.includes('space-separated') || id.includes('comma-separated') ||
              id.includes('estree') || id.includes('bail') || id.includes('trough') ||
              id.includes('longest-streak') || id.includes('devlop') || id.includes('ccount') ||
              id.includes('character-entities') || id.includes('character-reference-invalid') ||
              id.includes('parse-entities') || id.includes('trim-lines') ||
              id.includes('is-alphabetical') || id.includes('is-alphanumerical') ||
              id.includes('is-decimal') || id.includes('is-hexadecimal') ||
              id.includes('style-to-object') || id.includes('style-to-js') ||
              id.includes('inline-style-parser') ||
              id.includes('decode-named') || id.includes('stringify-entities') ||
              id.includes('html-url-attributes') || id.includes('zwitch') ||
              id.includes('is-plain-obj')
            ) {
              return 'vendor-content';
            }

            // UI and styling libraries (check BEFORE 'react' to catch react-icons, react-helmet)
            if (id.includes('react-icons') || id.includes('react-helmet') || id.includes('@vercel')) {
              return 'vendor-ui';
            }

            // React core and router
            if (
              id.includes('react') || id.includes('scheduler') || id.includes('@remix-run') ||
              id.includes('invariant') || id.includes('shallowequal')
            ) {
              return 'vendor-react';
            }

            // Smooth scrolling (loaded on demand)
            if (id.includes('lenis')) {
              return 'vendor-lenis';
            }

            // Other vendor code
            return 'vendor-misc';
          }

          // Project-specific chunks
          if (id.includes('src/assets/projects/')) {
            const projectMatch = id.match(/projects\/([^/]+)\//);
            if (projectMatch) {
              return `project-${projectMatch[1]}`;
            }
            // Projects barrel (index.ts) — keep with ProjectGrid
            return 'project-grid';
          }

          // Origami chunks
          if (id.includes('src/assets/origami/')) {
            return 'origami-assets';
          }

          // Component chunks
          if (id.includes('src/components/ui/base/')) {
            return 'ui-base';
          }

          // Layout components (Navbar, Footer, SEO, etc.) are used on every
          // page — keep them with the always-loaded base UI chunk
          if (id.includes('src/components/layout/')) {
            return 'ui-base';
          }

          if (id.includes('src/components/admin/')) {
            return 'admin-components';
          }

          // ProjectGrid + projects barrel: heavy chunk that eagerly imports all
          // project data via import.meta.glob — isolate from lighter card/UI code
          if (id.includes('components/portfolio/ProjectGrid')) {
            return 'project-grid';
          }

          // Merge all visual display components (cards, grids, carousels,
          // search, lightbox) into one chunk to prevent circular cross-chunk
          // dependencies between portfolio-card ↔ origami-card ↔ shared-grid
          if (
            id.includes('src/components/portfolio/') ||
            id.includes('src/components/origami/') ||
            (id.includes('src/components/ui/') && !id.includes('src/components/ui/base/')) ||
            id.includes('src/components/search/')
          ) {
            return 'shared-components';
          }

          // Page chunks
          if (id.includes('src/pages/')) {
            const pageMatch = id.match(/pages\/([^/]+)\.tsx?$/);
            if (pageMatch) {
              return `page-${pageMatch[1].toLowerCase()}`;
            }
          }

          // Utils and config
          if (id.includes('src/utils/') || id.includes('src/config/')) {
            return 'utils';
          }
        }
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
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 500,
  },
  assetsInclude: ['**/*.md'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'], // Ensure React is pre-bundled
  }
}))
