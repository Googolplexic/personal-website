import type { Config } from '@react-router/dev/config'
import { sitePaths } from './scripts/content-routes.ts'

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: () => [...sitePaths(), '/search-index.json'],
} satisfies Config
