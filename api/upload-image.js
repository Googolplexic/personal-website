// Vercel serverless function to upload images via GitHub API
import { uploadImageToGitHub, isOptimizableImage, getWebpPath, optimizeImageBuffer, imageUploadPath, deleteLargerWebCopies, MAX_IMAGE_BYTES } from './github-utils.js';
import { requireAdmin } from './auth-utils.js';
import { withIdempotency } from './idempotency-utils.js';

export default withIdempotency(async function handler(req, res) {
    if (!requireAdmin(req, res)) return;

    if (req.method === 'POST') {
        try {
            const { type, slug, category, imageData, fileName } = req.body;

            if (!type || !slug || !imageData) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Determine file extension from data URL
            const matches = imageData.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,/);
            if (!matches) {
                return res.status(400).json({ error: 'Invalid image data format' });
            }

            const base64Data = imageData.split(',')[1];
            if (!base64Data || !base64Data.trim()) {
                return res.status(400).json({ error: 'Image data is empty' });
            }
            const imageBuffer = Buffer.from(base64Data, 'base64');
            if (!imageBuffer.length) {
                return res.status(400).json({ error: 'Image file is empty or invalid' });
            }
            if (imageBuffer.length > MAX_IMAGE_BYTES) {
                return res.status(413).json({ error: 'Image is larger than 3 MB' });
            }

            const imagePath = imageUploadPath(type === 'origami' ? 'origami' : type, slug, category, fileName);
            if (!imagePath) {
                return res.status(400).json({ error: 'Invalid image path' });
            }

            // Upload image to GitHub
            const uploaded = await uploadImageToGitHub(
                imagePath,
                imageBuffer,
                `Upload image for ${type === 'origami' ? 'origami' : 'project'} ${slug}`
            );

            // Also generate and upload the optimized web/ version, unless the same image was already there
            if (uploaded && isOptimizableImage(imagePath)) {
                try {
                    const webpBuffer = await optimizeImageBuffer(imageBuffer);
                    const webpPath = getWebpPath(imagePath);
                    await uploadImageToGitHub(
                        webpPath,
                        webpBuffer,
                        `Upload optimized webp for ${type === 'origami' ? 'origami' : 'project'} ${slug}`
                    );
                } catch (webpErr) {
                    console.error('Warning: webp optimization failed (original still uploaded):', webpErr.message);
                }
                try {
                    await deleteLargerWebCopies(imagePath, `Remove stale web copies for ${type === 'origami' ? 'origami' : 'project'} ${slug}`);
                } catch (webpErr) {
                    console.error('Warning: failed to remove stale web copies:', webpErr.message);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                path: imagePath,
            });

        } catch (error) {
            console.error('Error uploading image:', error);
            return res.status(500).json({ error: 'Failed to upload image' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
