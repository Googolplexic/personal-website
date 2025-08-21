import chokidar from 'chokidar';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncProjectConfig } from './project-auto-config.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');
const projectsDir = resolve(rootDir, 'src/assets/projects');

let syncTimeout = null;

/**
 * Debounced sync to avoid excessive updates
 */
function debouncedSync() {
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(() => {
        console.log('\n🔄 Projects changed, syncing configuration...');
        syncProjectConfig();
        console.log('✅ Sync complete\n');
    }, 1000); // Wait 1 second after last change
}

/**
 * Starts watching the projects directory for changes
 */
export function startProjectWatcher() {
    console.log('🔍 Starting project directory watcher...');
    console.log(`Watching: ${projectsDir}`);

    const watcher = chokidar.watch(projectsDir, {
        persistent: true,
        ignoreInitial: true,
        depth: 3, // Watch subdirectories
        ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
            '**/.DS_Store',
            '**/Thumbs.db'
        ]
    });

    watcher
        .on('add', (path) => {
            console.log(`📁 File added: ${path}`);
            debouncedSync();
        })
        .on('change', (path) => {
            console.log(`📝 File changed: ${path}`);
            debouncedSync();
        })
        .on('unlink', (path) => {
            console.log(`🗑️  File removed: ${path}`);
            debouncedSync();
        })
        .on('addDir', (path) => {
            console.log(`📂 Directory added: ${path}`);
            debouncedSync();
        })
        .on('unlinkDir', (path) => {
            console.log(`🗂️  Directory removed: ${path}`);
            debouncedSync();
        })
        .on('error', (error) => {
            console.error('❌ Watcher error:', error);
        })
        .on('ready', () => {
            console.log('✅ Project watcher ready');
            // Initial sync
            syncProjectConfig();
        });

    // Cleanup function
    return () => {
        console.log('🔴 Stopping project watcher...');
        watcher.close();
    };
}

// If this file is run directly, start the watcher
if (import.meta.url === `file://${process.argv[1]}`) {
    const cleanup = startProjectWatcher();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        cleanup();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        cleanup();
        process.exit(0);
    });
}
