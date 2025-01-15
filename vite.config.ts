import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
const names = [
  'origami',
  'portfolio',
  'portfolio/personal-website',
]
const dynamicRoutes = names.map(name => `/${name}`)
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), Sitemap({ hostname: "https://www.colemanlai.com", readable: true, dynamicRoutes }),],
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
