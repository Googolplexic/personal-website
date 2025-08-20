// Vercel serverless function to get content list via GitHub API
import { Octokit } from '@octokit/rest';

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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const { type } = req.query;

            if (!type || !['projects', 'origami'].includes(type)) {
                return res.status(400).json({ error: 'Invalid type parameter' });
            }

            // Get directory contents from GitHub
            const response = await octokit.rest.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: `src/assets/${type}`,
            });

            const items = [];

            for (const item of response.data) {
                if (item.type === 'dir') {
                    try {
                        // Get the index.ts file for each project/origami
                        const indexResponse = await octokit.rest.repos.getContent({
                            owner: REPO_OWNER,
                            repo: REPO_NAME,
                            path: `${item.path}/index.ts`,
                        });

                        const content = Buffer.from(indexResponse.data.content, 'base64').toString('utf-8');

                        // Parse basic info from the TypeScript file
                        const titleMatch = content.match(/title: '([^']+)'/);
                        const title = titleMatch ? titleMatch[1] : item.name;

                        items.push({
                            slug: item.name,
                            title: title,
                            path: item.path,
                        });
                    } catch (error) {
                        // Skip items that don't have index.ts
                        console.warn(`Skipping ${item.name}: ${error.message}`);
                    }
                }
            }

            return res.status(200).json({ items });

        } catch (error) {
            console.error('Error getting content list:', error);
            return res.status(500).json({
                error: 'Failed to get content list',
                details: error.message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
