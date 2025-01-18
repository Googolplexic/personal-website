import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { statSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const portfolioProjects = {
  'personal-website': { priority: 0.7, changefreq: 'weekly' },
  'be-square': { priority: 0.7, changefreq: 'weekly' },
  'sfu-scheduler': { priority: 0.7, changefreq: 'weekly' },
  'machi-ne': { priority: 0.6, changefreq: 'weekly' },
  'salmon-run': { priority: 0.3, changefreq: 'weekly' },
  'origami-fractions': { priority: 0.7, changefreq: 'weekly' },
  'box-pleating': { priority: 0.6, changefreq: 'weekly' },
  'fold-preview': { priority: 0.6, changefreq: 'weekly' },
  'pdf-merge': { priority: 0.3, changefreq: 'weekly' },
  'youtube-speed': { priority: 0.3, changefreq: 'weekly' },
  'lol-bot': { priority: 0.1, changefreq: 'never' },
}

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
  '/origami': 'monthly',
  '/portfolio': 'daily',
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
  const stats = statSync(fullPath)
  if (stats.isDirectory()) {
    const files = readdirSync(fullPath)
    const latest = files.reduce((latest, file) => {
      const fileStats = statSync(resolve(fullPath, file))
      return fileStats.mtime > latest ? fileStats.mtime : latest
    }, new Date(0))
    cache[path] = latest
    return latest
  }
  cache[path] = stats.mtime
  return stats.mtime
}

const routeLastMod = {
  '/': cache['pages/Home.tsx'] || getLastModTime('pages/Home.tsx'),
  '/origami': cache['pages/Origami.tsx'] || getLastModTime('pages/Origami.tsx'),
  '/portfolio': cache['pages/Portfolio.tsx'] || getLastModTime('pages/Portfolio.tsx'),
  ...Object.fromEntries(
    Object.keys(portfolioProjects).map(name => {
      const path = `assets/projects/${name}`
      return [`/portfolio/${name}`, cache[path] || getLastModTime(path)]
    })
  )
}

saveCache(cache)

export default defineConfig({
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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
