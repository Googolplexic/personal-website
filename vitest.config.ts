import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts, whose React Router plugin can't run under Vitest
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs', 'tests/unit/**/*.test.mjs'],
    environment: 'node',
  },
})
