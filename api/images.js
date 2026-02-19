// Vercel serverless function to manage images via GitHub API
import { getImageFromGitHub, uploadImageToGitHub, deleteFileFromGitHub, getFileFromGitHub, isOptimizableImage, getWebpPath, optimizeImageBuffer } from './github-utils.js';
import { verifyJWT, parseCookies } from './auth-utils.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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

    try {
        const { path: requestPath, file } = req.query;

        if (!requestPath) {
            return res.status(400).json({ error: 'Path parameter is required' });
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

        if (req.method === 'GET') {
            // Get image file
            if (!file) {
                return res.status(400).json({ error: 'File parameter is required for GET' });
            }

            const fullPath = `${basePath}/${file}`;
            const fileData = await getImageFromGitHub(fullPath);

            if (!fileData) {
                return res.status(404).json({ error: 'Image not found' });
            }

            // Return the base64 content directly
            return res.status(200).json({
                content: fileData.content, // This is already base64 encoded from GitHub
                path: fullPath,
                type: 'image'
            });

        } else if (req.method === 'POST') {
            // Upload new image
            const { imageData, fileName } = req.body;

            if (!imageData || !fileName) {
                return res.status(400).json({ error: 'imageData and fileName are required' });
            }

            // Convert base64 to buffer
            const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // For projects, images go into images/ subdirectory
            // For origami, images go directly in the folder
            let fullPath;
            if (requestPath.startsWith('project/')) {
                fullPath = `${basePath}/images/${fileName}`;
            } else {
                fullPath = `${basePath}/${fileName}`;
            }

            await uploadImageToGitHub(
                fullPath,
                imageBuffer,
                `Upload image ${fileName} to ${requestPath}`
            );

            // Also generate and upload the optimized web/ version
            if (isOptimizableImage(fullPath)) {
                try {
                    const webpBuffer = await optimizeImageBuffer(imageBuffer);
                    const webpPath = getWebpPath(fullPath);
                    await uploadImageToGitHub(
                        webpPath,
                        webpBuffer,
                        `Upload optimized webp for ${fileName}`
                    );
                } catch (webpErr) {
                    console.error('Warning: webp optimization failed (original still uploaded):', webpErr.message);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                path: fullPath
            });

        } else if (req.method === 'DELETE') {
            // Delete image
            if (!file) {
                return res.status(400).json({ error: 'File parameter is required for DELETE' });
            }

            const fullPath = `${basePath}/${file}`;

            await deleteFileFromGitHub(
                fullPath,
                `Delete image ${file} from ${requestPath}`
            );

            // Also delete the optimized web/ version if it exists
            if (isOptimizableImage(fullPath)) {
                try {
                    const webpPath = getWebpPath(fullPath);
                    const webpFile = await getFileFromGitHub(webpPath);
                    if (webpFile) {
                        await deleteFileFromGitHub(
                            webpPath,
                            `Delete optimized webp for ${file}`
                        );
                    }
                } catch (webpErr) {
                    console.error('Warning: failed to delete webp (original still deleted):', webpErr.message);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        }

    } catch (error) {
        console.error('Error handling image request:', error);
        return res.status(500).json({
            error: 'Failed to handle image request',
            details: error.message,
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
