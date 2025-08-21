#!/usr/bin/env node

/**
 * Build hook script to ensure project configuration is synchronized
 * This runs before the build to make sure all projects are properly configured
 * and the cache is up to date
 */

import { syncProjectConfig } from './project-auto-config.js';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectsDir = resolve(__dirname, '..', 'src', 'assets', 'projects');

console.log('🔧 Pre-build: Synchronizing project configuration...');

// Detect any new or missing projects
const currentProjects = readdirSync(projectsDir, { withFileTypes: true })
    .filter(entry =>
        entry.isDirectory() &&
        entry.name !== 'template' &&
        existsSync(resolve(projectsDir, entry.name, 'index.ts'))
    )
    .map(entry => entry.name)
    .sort();

console.log(`📊 Found ${currentProjects.length} projects:`);
currentProjects.forEach(project => console.log(`  - ${project}`));

// Sync the configuration
const result = syncProjectConfig();

if (result.cacheUpdated) {
    console.log('✅ Cache updated successfully');
}

if (result.viteUpdated) {
    console.log('✅ Vite configuration updated successfully');
}

console.log('🚀 Pre-build synchronization complete!');
