// Vercel serverless function to create projects/origami via GitHub API
import { updateFileInGitHub, generateProjectStructure, generateOrigamiStructure, getFileFromGitHub } from './github-utils.js';
import { verifyJWT, parseCookies } from './auth-utils.js';

function normalizeSlug(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
            const { type, ...data } = req.body;

            if (!type) {
                return res.status(400).json({ error: 'Type is required' });
            }

            let slug;
            if (type === 'origami') {
                slug = await createOrigami(data);
            } else if (type === 'project') {
                slug = await createProject(data);
            } else {
                return res.status(400).json({ error: 'Invalid type. Must be "origami" or "project"' });
            }

            // Update the lastmod cache for the new content
            if (type === 'project') {
                await updateLastModCache(`assets/projects/${slug}`, slug);
            } else {
                await updateLastModCache(`assets/origami/${data.category}/${slug}`, slug);
            }

            return res.status(200).json({
                success: true,
                message: `${type} created successfully`,
                slug: slug,
            });

        } catch (error) {
            console.error('Error creating content:', error);
            const message = error instanceof Error ? error.message : 'Failed to create content';
            const clientError = /required|Invalid|valid slug/.test(message);
            return res.status(clientError ? 400 : 500).json({
                error: clientError ? message : `Failed to create ${req.body?.type || 'content'}`,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function createOrigami(data) {
    const { title, description, date, designer, category, slug: customSlug } = data;

    if (!title || !category) {
        throw new Error('Title and category are required for origami');
    }
    if (category !== 'my-designs' && category !== 'other-designs') {
        throw new Error('Invalid origami category');
    }

    // Use provided slug when available, otherwise generate from title
    const slug = normalizeSlug(customSlug || title);
    if (!slug) {
        throw new Error('Could not generate a valid slug from the provided title/slug');
    }

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

    // Images are uploaded separately via /api/upload-image to avoid payload size limits
    return slug;
}

async function createProject(data) {
    const {
        title,
        description,
        summary,
        technologies,
        githubUrl,
        liveUrl,
        startDate,
        endDate,
        tags,
        keywords,
        SEOdescription,
        slug: customSlug
    } = data;

    if (!title || !description || !summary) {
        throw new Error('Title, description, and summary are required for projects');
    }

    // Use provided slug when available, otherwise generate from title
    const slug = normalizeSlug(customSlug || title);
    if (!slug) {
        throw new Error('Could not generate a valid slug from the provided title/slug');
    }

    // Generate project structure with all fields
    const structure = generateProjectStructure(
        slug,
        title,
        description,
        technologies || [],
        githubUrl,
        liveUrl,
        summary,
        startDate,
        endDate,
        tags || [],
        keywords || [],
        SEOdescription || summary
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

    // Images are uploaded separately via /api/upload-image to avoid payload size limits
    return slug;
}

/**
 * Updates the lastmod cache for a project
 */
async function updateLastModCache(cacheKey, slug) {
    try {
        const existing = await getFileFromGitHub('lastmod-cache.json');
        let currentCache = {};
        if (existing?.content) {
            const parsed = JSON.parse(existing.content);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                currentCache = parsed;
            }
        }

        currentCache[cacheKey] = new Date().toISOString();
        await updateFileInGitHub(
            'lastmod-cache.json',
            JSON.stringify(currentCache, null, 2),
            `Update lastmod cache for ${slug}`,
            existing?.sha || null
        );
    } catch (error) {
        console.error('Error updating lastmod cache:', error);
    }
}

