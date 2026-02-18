import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { statSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

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
 * Prune non-critical modulepreload hints to avoid connection congestion.
 * Keeps only the chunks needed for the initial home page render.
 */
function pruneModulePreloadsPlugin(): Plugin {
  const criticalChunks = [
    'vendor-react',
    'vendor-misc',
    'vendor-lenis',
    'utils',
    'ui-base',
    'page-home',
    'page-portfolio',
    'page-origami',
    'portfolio-components',
    'origami-components',
    'origami-assets',
    'search-components',
    'index'
  ]
  return {
    name: 'vite-plugin-prune-modulepreloads',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          /<link\s+rel="modulepreload"[^>]*href="([^"]*)"[^>]*>/gi,
          (match, href) => {
            const isCritical = criticalChunks.some(chunk => href.includes(chunk))
            return isCritical ? match : ''
          }
        )
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
    react(),
    inlineCssPlugin(),
    pruneModulePreloadsPlugin(),
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
          // Vendor libraries
          if (id.includes('node_modules')) {
            // React and core dependencies (including scheduler, router internals, and other transitive deps)
            if (
              id.includes('react') || id.includes('react-dom') || id.includes('react-router') ||
              id.includes('scheduler') || id.includes('@remix-run') ||
              id.includes('invariant') || id.includes('shallow-equal')
            ) {
              return 'vendor-react';
            }

            // UI and styling libraries
            if (id.includes('react-icons') || id.includes('react-helmet') || id.includes('@vercel')) {
              return 'vendor-ui';
            }

            // Markdown and content processing
            if (id.includes('marked') || id.includes('react-markdown') || id.includes('front-matter')) {
              return 'vendor-content';
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
          }

          // Origami chunks
          if (id.includes('src/assets/origami/')) {
            return 'origami-assets';
          }

          // Component chunks
          if (id.includes('src/components/ui/base/')) {
            return 'ui-base';
          }

          if (id.includes('src/components/admin/')) {
            return 'admin-components';
          }

          if (id.includes('src/components/portfolio/')) {
            return 'portfolio-components';
          }

          if (id.includes('src/components/origami/')) {
            return 'origami-components';
          }

          if (id.includes('src/components/search/')) {
            return 'search-components';
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
    assetsInlineLimit: 2048, // Reduce inline limit to prevent large base64 images
    chunkSizeWarningLimit: 500, // Warn for chunks larger than 500kb
  },
  assetsInclude: ['**/*.md'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'], // Ensure React is pre-bundled
  }
}))
