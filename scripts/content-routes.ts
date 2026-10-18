import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const assetsDir = fileURLToPath(new URL('../src/assets/', import.meta.url))

export const ORIGAMI_GROUPS = ['my-designs', 'other-designs'] as const
export type OrigamiGroup = (typeof ORIGAMI_GROUPS)[number]

function listContentSlugs(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'template' && existsSync(resolve(dir, entry.name, 'index.ts')))
    .map((entry) => entry.name)
    .sort()
}

export function scanProjects(): string[] {
  return listContentSlugs(resolve(assetsDir, 'projects'))
}

export function scanOrigami(): { slug: string; group: OrigamiGroup; path: string }[] {
  return ORIGAMI_GROUPS.flatMap((group) =>
    listContentSlugs(resolve(assetsDir, 'origami', group)).map((slug) => ({
      slug,
      group,
      path: `assets/origami/${group}/${slug}`,
    })),
  )
}

/** Every public page, in the form React Router's prerender and the sitemap expect. */
export function sitePaths(): string[] {
  return [
    '/',
    '/portfolio',
    ...scanProjects().map((slug) => `/portfolio/${slug}`),
    '/origami',
    ...scanOrigami().map(({ slug }) => `/origami/${slug}`),
  ]
}
