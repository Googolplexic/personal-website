// Vercel serverless function to read/update content files via GitHub API
import { getFileFromGitHub, updateFileInGitHub, validateSessionToken } from './github-utils.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Simple auth check
    const authHeader = req.headers.authorization;
    if (!validateSessionToken(authHeader)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { path: requestPath, file } = req.query;

        if (!requestPath || !file) {
            return res.status(400).json({ error: 'Path and file parameters are required' });
        }

        // Determine the full path based on the request pattern
        let fullPath;
        if (requestPath.startsWith('project/')) {
            const slug = requestPath.replace('project/', '');
            fullPath = `src/assets/projects/${slug}/${file}`;
        } else if (requestPath.startsWith('origami/')) {
            const parts = requestPath.replace('origami/', '').split('/');
            const category = parts[0];
            const slug = parts[1];
            fullPath = `src/assets/origami/${category}/${slug}/${file}`;
        } else {
            return res.status(400).json({ error: 'Invalid path format' });
        }

        if (req.method === 'GET') {
            // Read file content
            const fileData = await getFileFromGitHub(fullPath);
            
            if (!fileData) {
                return res.status(404).json({ error: 'File not found' });
            }

            return res.status(200).json({
                content: fileData.content,
                sha: fileData.sha,
                path: fullPath
            });

        } else if (req.method === 'PUT') {
            // Update file content
            const { content, sha } = req.body;

            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            const result = await updateFileInGitHub(
                fullPath,
                content,
                `Update ${file} in ${requestPath}`,
                sha
            );

            return res.status(200).json({
                success: true,
                message: 'File updated successfully',
                sha: result.data.content.sha
            });
        }

    } catch (error) {
        console.error('Error handling content request:', error);
        return res.status(500).json({
            error: 'Failed to handle content request',
            details: error.message,
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
