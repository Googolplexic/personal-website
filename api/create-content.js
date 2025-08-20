// Vercel serverless function to create projects via GitHub API
import { updateFileInGitHub, generateProjectStructure, uploadImageToGitHub, getFileFromGitHub } from './github-utils.js';

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
            const { type, title, description, technologies, images } = req.body;

            if (!type || !title || !description) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Generate slug from title
            const slug = title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            // Generate project structure
            const structure = generateProjectStructure(
                type,
                slug,
                title,
                description,
                technologies || [],
                images || []
            );

            // Create description.md
            await updateFileInGitHub(
                structure.descriptionPath,
                structure.descriptionContent,
                `Add ${type.slice(0, -1)} ${title} - description`
            );

            // Create index.ts
            await updateFileInGitHub(
                structure.indexPath,
                structure.indexContent,
                `Add ${type.slice(0, -1)} ${title} - configuration`
            );

            // Create images directory if images are provided
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const image = images[i];
                    const imagePath = `${structure.basePath}/images/${i + 1}.${image.ext}`;

                    // Convert base64 to buffer
                    const imageBuffer = Buffer.from(image.data.split(',')[1], 'base64');

                    await uploadImageToGitHub(
                        imagePath,
                        imageBuffer,
                        `Add ${type.slice(0, -1)} ${title} - image ${i + 1}`
                    );
                }
            }

            // Update main index.ts file to include new project/origami
            await updateMainIndex(type, slug, title);

            return res.status(200).json({
                success: true,
                message: `${type.slice(0, -1)} created successfully`,
                slug: slug,
            });

        } catch (error) {
            console.error('Error creating project:', error);
            return res.status(500).json({
                error: 'Failed to create project',
                details: error.message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function updateMainIndex(type, slug, title) {
    const indexPath = `src/assets/${type}/index.ts`;
    const exportName = `${slug.replace(/-/g, '')}${type === 'projects' ? 'Project' : 'Design'}`;

    // Get current index file
    const currentFile = await getFileFromGitHub(indexPath);
    let content = currentFile ? currentFile.content : '';

    // Add import
    const importLine = `import { ${exportName} } from './${slug}';`;

    // Add to exports array
    const exportPattern = new RegExp(`export const ${type}: .*?\\[(.*?)\\];`, 's');
    const match = content.match(exportPattern);

    if (match) {
        const currentExports = match[1].trim();
        const newExports = currentExports
            ? `${currentExports},\n  ${exportName}`
            : exportName;

        content = content.replace(exportPattern, `export const ${type}: ${type === 'projects' ? 'Project' : 'OrigamiDesign'}[] = [\n  ${newExports}\n];`);
    } else {
        // Create new export if it doesn't exist
        content += `\nexport const ${type}: ${type === 'projects' ? 'Project' : 'OrigamiDesign'}[] = [\n  ${exportName}\n];`;
    }

    // Add import at the top
    if (!content.includes(importLine)) {
        content = `${importLine}\n${content}`;
    }

    await updateFileInGitHub(
        indexPath,
        content,
        `Update ${type} index - add ${title}`,
        currentFile ? currentFile.sha : null
    );
}
