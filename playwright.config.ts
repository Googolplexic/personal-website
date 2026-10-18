import { defineConfig, devices } from '@playwright/test'

const CI = !!process.env.CI
const PORT = 4173

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // Each worker is a whole browser; more than a few starve the animations and time out
  workers: 3,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // CI installs Playwright's Chromium; locally, use the installed Edge instead of downloading one
    channel: CI ? undefined : 'msedge',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Serves the built site, so run `pnpm build` first
  webServer: {
    command: 'node scripts/preview.mjs',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
  },
})
