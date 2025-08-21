import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');
const projectsDir = resolve(rootDir, 'src/assets/projects');
const viteConfigPath = resolve(rootDir, 'vite.config.ts');
const cacheFilePath = resolve(rootDir, 'lastmod-cache.json');

/**
 * Scans the projects directory and returns all valid project directories
 */
export function scanProjects() {
    try {
        const entries = readdirSync(projectsDir, { withFileTypes: true });
        const projects = entries
            .filter(entry =>
                entry.isDirectory() &&
                entry.name !== 'template' && // Exclude template directory
                existsSync(resolve(projectsDir, entry.name, 'index.ts')) // Must have index.ts
            )
            .map(entry => entry.name)
            .sort();

        return projects;
    } catch (error) {
        console.warn('Error scanning projects:', error);
        return [];
    }
}

/**
 * Gets the last modification time for a project directory
 */
export function getProjectLastMod(projectName) {
    const projectPath = resolve(projectsDir, projectName);
    try {
        const stats = statSync(projectPath);
        if (stats.isDirectory()) {
            const files = readdirSync(projectPath, { recursive: true });
            let latest = new Date(0);

            for (const file of files) {
                try {
                    const filePath = resolve(projectPath, file);
                    const fileStats = statSync(filePath);
                    if (fileStats.mtime > latest) {
                        latest = fileStats.mtime;
                    }
                } catch (err) {
                    // Skip files that can't be accessed
                    continue;
                }
            }
            return latest;
        }
        return stats.mtime;
    } catch (err) {
        console.warn(`Could not get modification time for project ${projectName}:`, err);
        return new Date();
    }
}

/**
 * Loads the current cache
 */
export function loadCache() {
    if (existsSync(cacheFilePath)) {
        try {
            return JSON.parse(readFileSync(cacheFilePath, 'utf-8'));
        } catch (error) {
            console.warn('Error loading cache, creating new one:', error);
        }
    }
    return {};
}

/**
 * Saves the cache
 */
export function saveCache(cache) {
    try {
        writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
    } catch (error) {
        console.error('Error saving cache:', error);
    }
}

/**
 * Updates the cache with current project modification times
 */
export function updateProjectCache() {
    const cache = loadCache();
    const projects = scanProjects();
    let updated = false;

    // Update cache for existing projects
    for (const project of projects) {
        const cacheKey = `assets/projects/${project}`;
        const currentMtime = getProjectLastMod(project);
        const cachedMtime = cache[cacheKey] ? new Date(cache[cacheKey]) : new Date(0);

        if (currentMtime > cachedMtime) {
            cache[cacheKey] = currentMtime.toISOString();
            updated = true;
            console.log(`Updated cache for project: ${project}`);
        }
    }

    // Remove cache entries for deleted projects
    const cacheKeys = Object.keys(cache).filter(key => key.startsWith('assets/projects/'));
    for (const cacheKey of cacheKeys) {
        const projectName = cacheKey.replace('assets/projects/', '');
        if (!projects.includes(projectName)) {
            delete cache[cacheKey];
            updated = true;
            console.log(`Removed cache for deleted project: ${projectName}`);
        }
    }

    if (updated) {
        saveCache(cache);
    }

    return { cache, updated, projects };
}

/**
 * Generates default project configuration
 */
export function generateDefaultProjectConfig(projectName) {
    // Try to determine priority and changefreq based on project characteristics
    let priority = 0.6; // default
    let changefreq = 'weekly'; // default

    // You can add logic here to determine priority based on project name patterns
    // or by reading project metadata
    const highPriorityProjects = ['personal-website', 'data-dave', 'origami-fractions'];
    const lowPriorityProjects = ['lol-bot'];

    if (highPriorityProjects.includes(projectName)) {
        priority = 0.7;
    } else if (lowPriorityProjects.includes(projectName)) {
        priority = 0.1;
        changefreq = 'never';
    }

    return { priority, changefreq };
}

/**
 * Updates the Vite config with current projects (Legacy function - now handled automatically in vite.config.ts)
 */
export function updateViteConfig() {
    // This function is now deprecated since the Vite config automatically detects projects
    // We keep it for compatibility but it's a no-op
    console.log('ℹ️  Vite config auto-detection is handled in vite.config.ts');
    return false;
}

/**
 * Main function to sync everything
 */
export function syncProjectConfig() {
    console.log('Syncing project configuration...');

    const cacheResult = updateProjectCache();
    const viteUpdated = updateViteConfig();

    console.log(`Found ${cacheResult.projects.length} projects`);

    if (cacheResult.updated) {
        console.log('✅ Cache updated');
    } else {
        console.log('ℹ️  Cache up to date');
    }

    if (viteUpdated) {
        console.log('✅ Vite config updated');
    } else {
        console.log('ℹ️  Vite config up to date');
    }

    return {
        projects: cacheResult.projects,
        cacheUpdated: cacheResult.updated,
        viteUpdated
    };
}

// If this file is run directly, execute the sync
if (import.meta.url.includes('project-auto-config.js')) {
    const result = syncProjectConfig();
    console.log('🚀 Sync completed!');
    console.log(`Projects: ${result.projects.join(', ')}`);
}
