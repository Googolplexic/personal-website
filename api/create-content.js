// Vercel serverless function to create projects/origami via GitHub API
import { updateFileInGitHub, generateProjectStructure, generateOrigamiStructure, uploadImageToGitHub, getFileFromGitHub } from './github-utils.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
            const { type, ...data } = req.body;

            if (!type) {
                return res.status(400).json({ error: 'Type is required' });
            }

            if (type === 'origami') {
                await createOrigami(data);
            } else if (type === 'project') {
                await createProject(data);
            } else {
                return res.status(400).json({ error: 'Invalid type. Must be "origami" or "project"' });
            }

            // Generate slug from title
            const slug = data.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            return res.status(200).json({
                success: true,
                message: `${type} created successfully`,
                slug: slug,
            });

        } catch (error) {
            console.error('Error creating content:', error);
            return res.status(500).json({
                error: `Failed to create ${req.body.type || 'content'}`,
                details: error.message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function createOrigami(data) {
    const { title, description, date, designer, category, images } = data;

    if (!title || !category) {
        throw new Error('Title and category are required for origami');
    }

    // Generate slug from title
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    // Generate origami structure
    const structure = generateOrigamiStructure(
        category,
        slug,
        title,
        description,
        date || new Date().toISOString().slice(0, 7), // YYYY-MM format
        designer
    );

    // Create info.md
    await updateFileInGitHub(
        structure.infoPath,
        structure.infoContent,
        `Add origami ${title} - info`
    );

    // Create index.ts
    await updateFileInGitHub(
        structure.indexPath,
        structure.indexContent,
        `Add origami ${title} - configuration`
    );

    // Upload images if provided
    if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const fileName = image.isPattern
                ? `${slug}-pattern.${image.ext}`
                : `${String(i + 1).padStart(2, '0')}-${slug}.${image.ext}`;
            const imagePath = `${structure.basePath}/${fileName}`;

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(image.data.split(',')[1], 'base64');

            await uploadImageToGitHub(
                imagePath,
                imageBuffer,
                `Add origami ${title} - ${image.isPattern ? 'pattern' : 'image'} ${i + 1}`
            );
        }
    }

    // Note: Index files use import.meta.glob, so no manual updates needed
}

async function createProject(data) {
    const { title, description, summary, technologies, githubUrl, liveUrl, images } = data;

    if (!title || !description || !summary) {
        throw new Error('Title, description, and summary are required for projects');
    }

    // Generate slug from title
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    // Generate project structure
    const structure = generateProjectStructure(
        slug,
        title,
        description,
        technologies || [],
        githubUrl,
        liveUrl,
        summary
    );

    // Create description.md
    await updateFileInGitHub(
        structure.descriptionPath,
        structure.descriptionContent,
        `Add project ${title} - description`
    );

    // Create index.ts
    await updateFileInGitHub(
        structure.indexPath,
        structure.indexContent,
        `Add project ${title} - configuration`
    );

    // Create images directory if images are provided
    if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const imagePath = `${structure.basePath}/images/${String(i + 1).padStart(2, '0')}-${slug}.${image.ext}`;

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(image.data.split(',')[1], 'base64');

            await uploadImageToGitHub(
                imagePath,
                imageBuffer,
                `Add project ${title} - image ${i + 1}`
            );
        }
    }

    // Note: Index files use import.meta.glob, so no manual updates needed
}


