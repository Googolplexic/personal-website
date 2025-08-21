# Automated Project Configuration System

This directory contains scripts that automatically manage project configuration and cache updates for the website's SEO and sitemap generation.

## Overview

The system automatically:
- 🔍 **Detects new projects** in `src/assets/projects/`
- 📝 **Updates the lastmod cache** for SEO
- ⚙️ **Configures Vite settings** dynamically
- 👀 **Watches for changes** during development

## Files

### `project-auto-config.js`
Core automation script that:
- Scans the projects directory for valid projects (must have `index.ts`)
- Updates the lastmod cache with current modification times
- Generates default project configurations (priority, changefreq)
- Can be run manually: `npm run sync-projects`

### `project-watcher.js`
Development file watcher that:
- Monitors `src/assets/projects/` for changes
- Automatically triggers sync when files are added/modified/deleted
- Uses debouncing to avoid excessive updates
- Run with: `npm run watch-projects`

### `vite-auto-config.js`
Vite plugin utilities (currently not used, kept for reference):
- Provides automated configuration for Vite builds
- Could be integrated into Vite config for more advanced features

### `build-hook.js`
Pre-build synchronization script:
- Runs before each build to ensure configuration is current
- Automatically included in `npm run build`
- Logs discovered projects and updates

## Usage

### Development Mode
```bash
# Start dev server with automatic project watching
npm run dev:watch

# Or run separately:
npm run dev          # Start Vite dev server
npm run watch-projects  # Start project watcher
```

### Manual Sync
```bash
# Manually sync project configuration
npm run sync-projects
```

### Production Build
```bash
# Build (automatically syncs first)
npm run build
```

## How It Works

### Project Detection
- Scans `src/assets/projects/` directory
- Includes directories with `index.ts` files
- Excludes `template` directory
- Automatically sorts projects alphabetically

### Cache Management
- Updates `lastmod-cache.json` with current file modification times
- Preserves manual cache updates (uses newer of cached vs filesystem time)
- Removes entries for deleted projects
- Adds entries for new projects

### Vite Configuration
The main `vite.config.ts` now automatically:
- Detects all valid projects
- Generates sitemap routes
- Sets default priorities and change frequencies
- Creates lastmod entries

### API Integration
- `api/create-content.js` automatically updates cache when creating projects via API
- `api/update-lastmod-cache.js` provides manual cache update endpoint

## Configuration

### Project Priorities
Projects get automatic priorities based on patterns:

- **High Priority (0.7)**: `personal-website`, `data-dave`, `origami-fractions`, `sfu-scheduler`, `be-square`
- **Medium Priority (0.6)**: `machi-ne`, `box-pleating`, `fold-preview`
- **Low Priority (0.3)**: `spirit-of-salmon`, `pdf-merge`, `youtube-speed`
- **Very Low Priority (0.1)**: `lol-bot` (changefreq: never)
- **Default Priority (0.6)**: All other projects

### Customization
To customize project configurations, edit the `generateProjectConfig()` function in:
- `project-auto-config.js` (for manual sync)
- `vite.config.ts` (for build-time configuration)

## Benefits

✅ **No more manual updates** - Projects are automatically detected and configured
✅ **API integration** - New projects via API automatically update cache
✅ **Development workflow** - File watcher detects manual project additions
✅ **Build-time sync** - Ensures production builds have current configuration
✅ **SEO optimization** - Automatic lastmod cache management
✅ **Maintainable** - Centralized configuration logic

## Troubleshooting

### Cache Issues
- Run `npm run sync-projects` to manually refresh
- Check `lastmod-cache.json` for current state
- Verify project directories have `index.ts` files

### Missing Projects
- Ensure project directory has `index.ts`
- Check it's not named `template`
- Run sync manually to verify detection

### Development Watching
- Ensure `chokidar` dependency is installed
- Check terminal for watcher status messages
- Restart watcher if changes aren't detected
