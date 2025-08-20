// Vercel serverless function to upload images via GitHub API
import { uploadImageToGitHub } from './github-utils.js';

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
