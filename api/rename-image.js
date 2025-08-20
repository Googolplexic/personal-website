// Vercel serverless function to rename images via GitHub API
import { getFileFromGitHub, uploadImageToGitHub, deleteFileFromGitHub } from './github-utils.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Simple auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            const { path: requestPath, file, newName } = req.body;

            if (!requestPath || !file || !newName) {
                return res.status(400).json({ error: 'path, file, and newName are required' });
            }

            // Determine the full path based on the request pattern
            let basePath;
            if (requestPath.startsWith('project/')) {
                const slug = requestPath.replace('project/', '');
                basePath = `src/assets/projects/${slug}`;
            } else if (requestPath.startsWith('origami/')) {
                const parts = requestPath.replace('origami/', '').split('/');
                const category = parts[0];
                const slug = parts[1];
                basePath = `src/assets/origami/${category}/${slug}`;
            } else {
                return res.status(400).json({ error: 'Invalid path format' });
            }

            const oldPath = `${basePath}/${file}`;
            const newPath = `${basePath}/${newName}`;

            // Get the existing file
            const fileData = await getFileFromGitHub(oldPath);

            if (!fileData) {
                return res.status(404).json({ error: 'Original file not found' });
            }

            // Create new file with the same content
            const imageBuffer = Buffer.from(fileData.content, 'base64');
            await uploadImageToGitHub(
                newPath,
                imageBuffer,
                `Rename image from ${file} to ${newName} in ${requestPath}`
            );

            // Delete the old file
            await deleteFileFromGitHub(
                oldPath,
                `Remove old image ${file} after rename to ${newName} in ${requestPath}`
            );

            return res.status(200).json({
                success: true,
                message: 'Image renamed successfully',
                oldPath: oldPath,
                newPath: newPath
            });

        } catch (error) {
            console.error('Error renaming image:', error);
            return res.status(500).json({
                error: 'Failed to rename image',
                details: error.message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
