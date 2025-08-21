// Vercel serverless function to update the lastmod cache
import { verifyJWT, parseCookies } from './auth-utils.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Validate authentication using cookies
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.adminToken;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyJWT(token);
    if (!decoded || !decoded.admin) {
        return res.status(401).json({ error: 'Invalid authentication' });
    }

    if (req.method === 'POST') {
        try {
            // Import the sync function dynamically since we're in a serverless environment
            // Note: This would need to be adapted for Vercel's environment
            // For now, we'll implement a simpler version that works with the GitHub API

            const { projectName, action = 'update' } = req.body;

            // Create a commit to update the lastmod cache
            // This will trigger a rebuild which will update the cache
            const { Octokit } = await import('@octokit/rest');

            const octokit = new Octokit({
                auth: process.env.GITHUB_TOKEN,
            });

            const owner = process.env.GITHUB_OWNER || 'Googolplexic';
            const repo = process.env.GITHUB_REPO || 'personal-website';

            // Get the current cache file
            let currentCache = {};
            try {
                const { data: cacheFile } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: 'lastmod-cache.json',
                });

                const content = Buffer.from(cacheFile.content, 'base64').toString('utf-8');
                currentCache = JSON.parse(content);
            } catch (error) {
                console.log('Cache file not found, creating new one');
            }

            // Update the cache with current timestamp
            if (projectName) {
                const cacheKey = `assets/projects/${projectName}`;
                currentCache[cacheKey] = new Date().toISOString();
            } else {
                // Update all project timestamps
                // This would require scanning the repository, but for now we'll just update the timestamp
                const timestamp = new Date().toISOString();

                // Update known project paths
                const projectPaths = Object.keys(currentCache).filter(key => key.startsWith('assets/projects/'));
                for (const path of projectPaths) {
                    currentCache[path] = timestamp;
                }
            }

            // Update the cache file in the repository
            const newContent = JSON.stringify(currentCache, null, 2);
            const encodedContent = Buffer.from(newContent).toString('base64');

            const commitMessage = projectName
                ? `Update lastmod cache for project: ${projectName}`
                : 'Update lastmod cache for all projects';

            try {
                // Try to update existing file
                const { data: existingFile } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: 'lastmod-cache.json',
                });

                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: 'lastmod-cache.json',
                    message: commitMessage,
                    content: encodedContent,
                    sha: existingFile.sha,
                });
            } catch (error) {
                // Create new file if it doesn't exist
                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: 'lastmod-cache.json',
                    message: commitMessage,
                    content: encodedContent,
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Cache updated successfully',
                timestamp: new Date().toISOString(),
                projectName: projectName || 'all'
            });

        } catch (error) {
            console.error('Error updating cache:', error);
            return res.status(500).json({
                error: 'Failed to update cache',
                details: error.message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}