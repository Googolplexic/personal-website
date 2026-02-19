// Vercel serverless function to rename images via GitHub API
import { getFileFromGitHub, getImageFromGitHub, uploadImageToGitHub, deleteFileFromGitHub, isOptimizableImage, getWebpPath, optimizeImageBuffer } from './github-utils.js';
import { verifyJWT, parseCookies } from './auth-utils.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
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

    if (req.method === 'PUT') {
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

            const oldFilePath = `${basePath}/${file}`;
            const newFilePath = `${basePath}/${newName}`;

            // Get the existing image as raw base64 so we can re-upload it
            const existingFileData = await getImageFromGitHub(oldFilePath);
            if (!existingFileData) {
                return res.status(404).json({ error: 'File not found' });
            }

            const imageBuffer = Buffer.from(existingFileData.content, 'base64');

            // Upload the file with the new name
            await uploadImageToGitHub(newFilePath, imageBuffer, `Rename ${file} to ${newName}`);

            // Delete the old file
            await deleteFileFromGitHub(oldFilePath, `Remove old file ${file} after renaming to ${newName}`);

            // Handle the web/ optimized versions
            if (isOptimizableImage(oldFilePath)) {
                const oldWebpPath = getWebpPath(oldFilePath);
                const newWebpPath = getWebpPath(newFilePath);

                try {
                    // Generate fresh webp from the image and upload at new path
                    const webpBuffer = await optimizeImageBuffer(imageBuffer);
                    await uploadImageToGitHub(newWebpPath, webpBuffer, `Upload optimized webp for renamed ${newName}`);
                } catch (webpErr) {
                    console.error('Warning: webp generation for renamed file failed:', webpErr.message);
                }

                try {
                    // Delete old webp if it exists
                    const oldWebp = await getFileFromGitHub(oldWebpPath);
                    if (oldWebp) {
                        await deleteFileFromGitHub(oldWebpPath, `Remove old webp after renaming ${file}`);
                    }
                } catch (webpErr) {
                    console.error('Warning: failed to delete old webp:', webpErr.message);
                }
            }

            res.status(200).json({
                message: `File renamed from ${file} to ${newName}`,
                oldPath: oldFilePath,
                newPath: newFilePath
            });

        } catch (error) {
            console.error('Error renaming file:', error);
            res.status(500).json({ 
                error: 'Failed to rename file',
                details: error.message 
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
