// Vercel serverless function to get file lists via GitHub API
import { Octokit } from '@octokit/rest';
import { validateSessionToken } from './github-utils.js';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = 'Googolplexic';
const REPO_NAME = 'personal-website';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Simple auth check
    const authHeader = req.headers.authorization;
    if (!validateSessionToken(authHeader)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const { path: requestPath } = req.query;

            if (!requestPath) {
                return res.status(400).json({ error: 'Path parameter is required' });
            }

            // Determine the full path based on the request pattern
            let fullPath;
            if (requestPath.startsWith('project/')) {
                const slug = requestPath.replace('project/', '');
                fullPath = `src/assets/projects/${slug}`;
            } else if (requestPath.startsWith('origami/')) {
                const parts = requestPath.replace('origami/', '').split('/');
                const category = parts[0];
                const slug = parts[1];
                fullPath = `src/assets/origami/${category}/${slug}`;
            } else {
                return res.status(400).json({ error: 'Invalid path format' });
            }

            // Get directory contents from GitHub
            const response = await octokit.rest.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: fullPath,
            });

            if (!Array.isArray(response.data)) {
                return res.status(400).json({ error: 'Path is not a directory' });
            }

            const files = response.data
                .filter(item => item.type === 'file')
                .map(item => ({
                    name: item.name,
                    path: item.path,
                    type: item.name.endsWith('.md') ? 'markdown' :
                        item.name.endsWith('.ts') ? 'typescript' :
                            item.name.match(/\.(png|jpg|jpeg|webp)$/i) ? 'image' : 'other'
                }));

            const directories = response.data
                .filter(item => item.type === 'dir')
                .map(item => ({
                    name: item.name,
                    path: item.path,
                    type: 'directory'
                }));

            return res.status(200).json({
                files: [...files, ...directories]
            });

        } catch (error) {
            console.error('Error getting file list:', error);
            return res.status(500).json({
                error: 'Failed to get file list',
                details: error.message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
