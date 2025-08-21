// Vercel serverless function to get content list via GitHub API
import { Octokit } from '@octokit/rest';
import { verifyJWT, parseCookies } from './auth-utils.js';

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

    if (req.method === 'GET') {
        try {
            const { type } = req.query;

            if (!type || !['projects', 'origami'].includes(type)) {
                return res.status(400).json({ error: 'Invalid type parameter' });
            }

            const items = [];

            if (type === 'projects') {
                // Get projects directory
                const response = await octokit.rest.repos.getContent({
                    owner: REPO_OWNER,
                    repo: REPO_NAME,
                    path: `src/assets/projects`,
                });

                for (const item of response.data) {
                    if (item.type === 'dir' && !item.name.includes('template')) {
                        items.push({
                            slug: item.name,
                            title: item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            path: item.name,
                        });
                    }
                }
            } else if (type === 'origami') {
                // Get both my-designs and other-designs
                const categories = ['my-designs', 'other-designs'];

                for (const category of categories) {
                    try {
                        const response = await octokit.rest.repos.getContent({
                            owner: REPO_OWNER,
                            repo: REPO_NAME,
                            path: `src/assets/origami/${category}`,
                        });

                        for (const item of response.data) {
                            if (item.type === 'dir' && !item.name.includes('template')) {
                                items.push({
                                    slug: item.name,
                                    title: item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                    path: item.name,
                                    category: category,
                                });
                            }
                        }
                    } catch (error) {
                        console.warn(`Could not read ${category}:`, error.message);
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
