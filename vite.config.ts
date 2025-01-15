import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { statSync, readdirSync } from 'fs'
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

const getLastModTime = (path: string) => {
  const fullPath = resolve(__dirname, "src/" + path)
  const stats = statSync(fullPath)
  if (stats.isDirectory()) {
    const files = readdirSync(fullPath)
    return files.reduce((latest, file) => {
      const fileStats = statSync(resolve(fullPath, file))
      return fileStats.mtime > latest ? fileStats.mtime : latest
    }, new Date(0))
  }
  return stats.mtime
}

const routeLastMod = {
  '/': getLastModTime('pages/Home.tsx'),
  '/origami': getLastModTime('pages/Origami.tsx'),
  '/portfolio': getLastModTime('pages/Portfolio.tsx'),
  '/portfolio/personal-website': getLastModTime('assets/projects/personal-website'),
}

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
