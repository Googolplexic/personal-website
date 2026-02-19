// Vercel serverless function to upload images via GitHub API
import { uploadImageToGitHub, isOptimizableImage, getWebpPath, optimizeImageBuffer } from './github-utils.js';
import { verifyJWT, parseCookies } from './auth-utils.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
            const { type, slug, imageData, imageIndex } = req.body;

            if (!type || !slug || !imageData) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Determine file extension from data URL
            const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,/);
            if (!matches) {
                return res.status(400).json({ error: 'Invalid image data format' });
            }

            const extension = matches[1];
            const base64Data = imageData.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // Generate image path
            const imagePath = `src/assets/${type}/${slug}/images/${imageIndex || 1}.${extension}`;

            // Upload image to GitHub
            await uploadImageToGitHub(
                imagePath,
                imageBuffer,
                `Upload image for ${type.slice(0, -1)} ${slug}`
            );

            // Also generate and upload the optimized web/ version
            if (isOptimizableImage(imagePath)) {
                try {
                    const webpBuffer = await optimizeImageBuffer(imageBuffer);
                    const webpPath = getWebpPath(imagePath);
                    await uploadImageToGitHub(
                        webpPath,
                        webpBuffer,
                        `Upload optimized webp for ${type.slice(0, -1)} ${slug}`
                    );
                } catch (webpErr) {
                    console.error('Warning: webp optimization failed (original still uploaded):', webpErr.message);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                path: imagePath,
            });

        } catch (error) {
            console.error('Error uploading image:', error);
            return res.status(500).json({
                error: 'Failed to upload image',
                details: error.message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
