import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

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

const routeLastMod = {
  '/': new Date('2025-01-15T08:39:00.000Z'),
  '/origami': new Date('2024-12-28T08:36:01.794Z'),
  '/portfolio': new Date('2025-01-15T08:39:00.000Z'),
  '/portfolio/personal-website': new Date('2025-01-15T08:39:00.000Z'),
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
