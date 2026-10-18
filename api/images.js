// Vercel serverless function to manage images via GitHub API
import { getImageFromGitHub, uploadImageToGitHub, deleteFileFromGitHub, getFileFromGitHub, isOptimizableImage, getWebpPath, optimizeImageBuffer, resolveContentDir, resolveImageFile, imageUploadPath, deleteLargerWebCopies, MAX_IMAGE_BYTES } from './github-utils.js';
import { requireAdmin } from './auth-utils.js';

export default async function handler(req, res) {
    if (!requireAdmin(req, res)) return;

    try {
        const { path: requestPath, file } = req.query;

        if (!requestPath) {
            return res.status(400).json({ error: 'Path parameter is required' });
        }

        const resolved = resolveContentDir(requestPath);
        if (!resolved) {
            return res.status(400).json({ error: 'Invalid path format' });
        }

        if (req.method === 'GET') {
            // Get image file
            if (!file) {
                return res.status(400).json({ error: 'File parameter is required for GET' });
            }

            const fullPath = resolveImageFile(requestPath, file);
            if (!fullPath) {
                return res.status(400).json({ error: 'Invalid file name' });
            }
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

            const fullPath = imageUploadPath(resolved.kind, resolved.slug, resolved.category, fileName);
            if (!fullPath) {
                return res.status(400).json({ error: 'Invalid file name' });
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
                try {
                    await deleteLargerWebCopies(fullPath, `Remove stale web copies for ${fileName}`);
                } catch (webpErr) {
                    console.error('Warning: failed to remove stale web copies:', webpErr.message);
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

            const fullPath = resolveImageFile(requestPath, file);
            if (!fullPath) {
                return res.status(400).json({ error: 'Invalid file name' });
            }

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
                try {
                    await deleteLargerWebCopies(fullPath, `Delete web copies for ${file}`);
                } catch (webpErr) {
                    console.error('Warning: failed to delete web copies:', webpErr.message);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        }

    } catch (error) {
        console.error('Error handling image request:', error);
        return res.status(500).json({ error: 'Failed to handle image request' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
