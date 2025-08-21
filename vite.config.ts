import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { statSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

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
        manualChunks: undefined
      }
    },
    assetsInlineLimit: 4096, // Inline small images as base64
  },
  assetsInclude: ['**/*.md'],
  optimizeDeps: {
    include: ['react', 'react-dom'], // Ensure React is pre-bundled
  }
}))
