import { defineConfig, type Plugin } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap'
import { statSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { getSiteVersionFromGit } from './scripts/site-version-from-git.mjs'
import { parseFrontmatter } from './scripts/frontmatter.mjs'
import { scanOrigami, scanProjects } from './scripts/content-routes.ts'

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
      const { attributes, body } = parseFrontmatter(readFileSync(id.slice(0, -7), 'utf-8'))
      return `export const attributes = ${JSON.stringify(attributes)};\nexport const body = ${JSON.stringify(body)};`
    }
  }
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const currentProjects = scanProjects()
const currentOrigami = scanOrigami()

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
const dynamicRoutes = ['/', ...names.map(name => `/${name}`)]

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

/** Writes sitemap.xml once the client build has written its files. */
function sitemapPlugin(): Plugin {
  const sitemap = Sitemap({
    hostname: "https://www.colemanlai.com",
    outDir: 'build/client',
    readable: true,
    generateRobotsTxt: false,
    // Pages are prerendered after this runs, so list every route instead of scanning for HTML
    extensions: [],
    dynamicRoutes,
    changefreq: routeChangeFreq,
    priority: routePriorities,
    lastmod: routeLastMod,
  })
  return {
    name: 'sitemap',
    apply: 'build',
    applyToEnvironment: (environment) => environment.name === 'client',
    writeBundle: () => sitemap.closeBundle(),
  }
}

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
    tailwindcss(),
    reactRouter(),
    sitemapPlugin(),
  ],
  build: {
    sourcemap: mode === 'development',
    rolldownOptions: {
      output: {
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
          if (ext === 'woff2') {
            return `assets/fonts/[name]-[hash][extname]`;
          }

          return `assets/[name]-[hash][extname]`;
        },
      }
    },
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 500,
  },
  assetsInclude: ['**/*.md'],
}))
