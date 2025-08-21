import { syncProjectConfig, loadCache, scanProjects } from '../scripts/project-auto-config.js';
import { startProjectWatcher } from '../scripts/project-watcher.js';

/**
 * Vite plugin to automatically manage project configuration and cache
 */
export function autoProjectConfigPlugin() {
    let isDevMode = false;
    let watcherCleanup = null;

    return {
        name: 'auto-project-config',

        configResolved(config) {
            isDevMode = config.command === 'serve';
        },

        buildStart() {
            console.log('🚀 Auto Project Config: Syncing project configuration...');

            // Always sync on build start
            const result = syncProjectConfig();

            if (isDevMode) {
                // Start file watcher in development mode
                console.log('🔧 Development mode: Starting project watcher...');
                watcherCleanup = startProjectWatcher();
            }

            console.log(`✅ Found ${result.projects.length} projects:`, result.projects.join(', '));
        },

        buildEnd() {
            // Cleanup watcher when build ends
            if (watcherCleanup) {
                watcherCleanup();
                watcherCleanup = null;
            }
        }
    };
}

/**
 * Gets current project configuration for use in Vite config
 */
export function getProjectConfig() {
    // Ensure projects are synced
    const result = syncProjectConfig();
    const cache = loadCache();

    const projects = result.projects;
    const portfolioProjects = {};

    // Generate portfolio projects configuration
    for (const project of projects) {
        // Default configuration - you can enhance this logic
        let priority = 0.6;
        let changefreq = 'weekly';

        // Special cases for known projects
        switch (project) {
            case 'personal-website':
            case 'data-dave':
            case 'origami-fractions':
                priority = 0.7;
                break;
            case 'lol-bot':
                priority = 0.1;
                changefreq = 'never';
                break;
            case 'spirit-of-salmon':
            case 'pdf-merge':
            case 'youtube-speed':
                priority = 0.3;
                break;
        }

        portfolioProjects[project] = { priority, changefreq };
    }

    // Generate route configurations
    const names = [
        'origami',
        'portfolio',
        ...projects.map(name => `portfolio/${name}`)
    ];

    const dynamicRoutes = names.map(name => `/${name}`);

    const routePriorities = {
        '/': 1.0,
        '/origami': 0.8,
        '/portfolio': 0.9,
        ...Object.fromEntries(
            Object.entries(portfolioProjects).map(([name, data]) =>
                [`/portfolio/${name}`, data.priority]
            )
        )
    };

    const routeChangeFreq = {
        '/': 'weekly',
        '/origami': 'weekly',
        '/portfolio': 'monthly',
        ...Object.fromEntries(
            Object.entries(portfolioProjects).map(([name, data]) =>
                [`/portfolio/${name}`, data.changefreq]
            )
        )
    };

    // Generate lastmod configuration
    const getUpdatedLastModTime = (path) => {
        const cacheKey = `assets/projects/${path.replace('assets/projects/', '')}`;
        const cachedTime = cache[cacheKey] || cache[path];
        return cachedTime ? new Date(cachedTime) : new Date();
    };

    const routeLastMod = {
        '/': cache['pages/Home.tsx'] ? new Date(cache['pages/Home.tsx']) : new Date(),
        '/origami': cache['pages/Origami.tsx'] ? new Date(cache['pages/Origami.tsx']) : new Date(),
        '/portfolio': cache['pages/Portfolio.tsx'] ? new Date(cache['pages/Portfolio.tsx']) : new Date(),
        ...Object.fromEntries(
            projects.map(name => {
                const path = `assets/projects/${name}`;
                return [`/portfolio/${name}`, getUpdatedLastModTime(path)];
            })
        )
    };

    return {
        portfolioProjects,
        dynamicRoutes,
        routePriorities,
        routeChangeFreq,
        routeLastMod,
        projects
    };
}
