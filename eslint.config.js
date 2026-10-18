import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'build', '.react-router', 'test-results', 'playwright-report']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      // Type-aware rules picked from strictTypeChecked; its no-unsafe-* rules flag the untyped
      // frontmatter and admin API responses everywhere without catching much
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/only-throw-error': ['error', {
        // Loaders throw data(null, { status: 404 }) for React Router to catch
        allow: [{ from: 'package', package: 'react-router', name: 'DataWithResponseInit' }],
      }],
      'react-refresh/only-export-components': [
        'warn',
        // React Router route module exports
        { allowConstantExport: true, allowExportNames: ['meta', 'links', 'loader', 'clientLoader', 'shouldRevalidate', 'Layout', 'HydrateFallback', 'ErrorBoundary'] },
      ],
    },
  },
])
