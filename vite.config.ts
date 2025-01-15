import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { statSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const names = [
  'origami',
  'portfolio',
  'portfolio/personal-website',
]
const dynamicRoutes = names.map(name => `/${name}`)

const routePriorities = {
  '/': 1.0,
  '/origami': 0.9,
  '/portfolio': 0.8,
  '/portfolio/personal-website': 0.7,
}

const routeChangeFreq = {
  '/': 'monthly',
  '/origami': 'monthly',
  '/portfolio': 'monthly',
  '/portfolio/personal-website': 'monthly',
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
  '/portfolio/personal-website': cache['assets/projects/personal-website'] || getLastModTime('assets/projects/personal-website'),
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
