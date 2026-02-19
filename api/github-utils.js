// GitHub API Admin System for Vercel
// This replaces the local file-based admin server with GitHub API calls

import { Octokit } from '@octokit/rest';

// Initialize GitHub client
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = 'Googolplexic';
const REPO_NAME = 'personal-website';
const BRANCH = 'main';

// Helper function to validate session token
export function validateSessionToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }

    try {
        const token = authHeader.substring(7);
        const decoded = Buffer.from(token, 'base64').toString();
        const [timestamp] = decoded.split('-');
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        return now - tokenTime < twentyFourHours;
    } catch (error) {
        return false;
    }
}

// Helper function to get file content from GitHub
export async function getFileFromGitHub(path) {
    try {
        const response = await octokit.rest.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: path,
            ref: BRANCH,
        });

        if (response.data.type === 'file') {
            return {
                content: Buffer.from(response.data.content, 'base64').toString('utf-8'),
                sha: response.data.sha,
            };
        }
        return null;
    } catch (error) {
        if (error.status === 404) {
            return null; // File doesn't exist
        }
        throw error;
    }
}

// Helper function to get image file content from GitHub (returns base64)
export async function getImageFromGitHub(path) {
    try {
        const response = await octokit.rest.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: path,
            ref: BRANCH,
        });

        if (response.data.type === 'file') {
            // For images, return the base64 content directly (GitHub API returns it base64 encoded)
            // Remove any newlines that GitHub might add
            const cleanBase64 = response.data.content.replace(/\n/g, '');
            return {
                content: cleanBase64,
                sha: response.data.sha,
            };
        }
        return null;
    } catch (error) {
        if (error.status === 404) {
            return null; // File doesn't exist
        }
        throw error;
    }
}

// Helper function to create/update file in GitHub
export async function updateFileInGitHub(path, content, message, sha = null) {
    const params = {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path,
        message: message,
        content: Buffer.from(content).toString('base64'),
        branch: BRANCH,
    };

    if (sha) {
        params.sha = sha; // Required for updates
    }

    return await octokit.rest.repos.createOrUpdateFileContents(params);
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const WEBP_MAX_WIDTH = 600;
const WEBP_QUALITY = 65;

// Compute the web/ optimized path for a given image path.
// e.g. "src/assets/origami/my-designs/foo/bar.png" → "src/assets/origami/my-designs/foo/web/bar.webp"
export function getWebpPath(imagePath) {
    const lastSlash = imagePath.lastIndexOf('/');
    const dir = imagePath.substring(0, lastSlash);
    const filename = imagePath.substring(lastSlash + 1);
    const dotIdx = filename.lastIndexOf('.');
    const name = dotIdx !== -1 ? filename.substring(0, dotIdx) : filename;
    return `${dir}/web/${name}.webp`;
}

// Returns true if the path looks like a full-size image that should have a webp.
export function isOptimizableImage(filePath) {
    // Ignore files already inside web/ directories
    if (filePath.includes('/web/')) return false;
    const dot = filePath.lastIndexOf('.');
    if (dot === -1) return false;
    return IMAGE_EXTS.includes(filePath.substring(dot).toLowerCase());
}

// Generate an optimized WebP buffer from a raw image buffer (same settings as optimize-images.mjs).
// sharp is loaded lazily so endpoints that never call this function don't pay the
// native-module import cost (and don't crash if sharp isn't available).
export async function optimizeImageBuffer(imageBuffer) {
    const sharp = (await import('sharp')).default;
    return sharp(imageBuffer)
        .resize(WEBP_MAX_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
}

// Helper function to upload images to GitHub
export async function uploadImageToGitHub(path, imageBuffer, message) {
    return await octokit.rest.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path,
        message: message,
        content: imageBuffer.toString('base64'),
        branch: BRANCH,
    });
}

// Helper function to delete file from GitHub
export async function deleteFileFromGitHub(path, message) {
    const file = await getFileFromGitHub(path);
    if (!file) {
        throw new Error('File not found');
    }

    return await octokit.rest.repos.deleteFile({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path,
        message: message,
        sha: file.sha,
        branch: BRANCH,
    });
}

// Generate origami structure
export function generateOrigamiStructure(category, slug, title, description, date, designer) {
    const basePath = `src/assets/origami/${category}/${slug}`;

    // Create info.md content with frontmatter
    const infoMd = `---
title: ${title}
date: ${date}${description ? `
description: ${description}` : ''}${designer ? `
designer: ${designer}` : ''}
---
`;

    // Create index.ts content matching existing structure
    const tagValue = category === 'my-designs' ? 'my-design' : 'other-design';
    const indexTs = `import { OrigamiProps } from '../../../../types';
import { attributes } from './info.md?parsed';

// Optimized web images (from scripts/optimize-images.mjs)
const webImages = Object.values(import.meta.glob('./web/*.webp', { eager: true, import: 'default' }))
    .filter((url: unknown) => !(url as string).includes('pattern'))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];
const fullImages = Object.values(import.meta.glob('./*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }))
    .filter((url: unknown) => !(url as string).includes('pattern'))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];
const modelImages = webImages.length > 0 ? webImages : fullImages;
const modelImagesFull = fullImages;

const webCP = Object.values(import.meta.glob('./web/*pattern*.webp', { eager: true, import: 'default' }));
const fullCP = Object.values(import.meta.glob('./*pattern*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }));
const creasePattern = (webCP[0] || fullCP[0]) as string | undefined;
const creasePatternFull = fullCP[0] as string | undefined;


export default {
    title: attributes.title,
    description: attributes.description,
    date: attributes.date,
    startDate: attributes.date,
    designer: attributes.designer,
    modelImages,
    modelImagesFull,
    creasePattern,
    creasePatternFull,
    keywords: ['origami', 'paper art', attributes.title?.toLowerCase().replace(/\\s+/g, '-')].filter(Boolean),
    tags: ['origami', '${tagValue}']
} as OrigamiProps;
`;

    return {
        infoPath: `${basePath}/info.md`,
        indexPath: `${basePath}/index.ts`,
        infoContent: infoMd,
        indexContent: indexTs,
        basePath,
    };
}

// Generate project structure
export function generateProjectStructure(slug, title, description, technologies, githubUrl, liveUrl, summary, startDate, endDate, tags, keywords, SEOdescription) {
    const basePath = `src/assets/projects/${slug}`;

    // Use provided dates or default to current date
    const projectStartDate = startDate || new Date().toISOString().split('T')[0];
    const projectEndDate = endDate || new Date().toISOString().split('T')[0];

    // Merge technologies with tags for a comprehensive list
    const allTags = [...(technologies || []), ...(tags || [])];
    const allKeywords = [...(technologies || []), ...(keywords || []), title.toLowerCase(), 'project'];

    // Create description.md content with frontmatter (similar to be-square)
    const descriptionMd = `---
title: ${title}
summary: ${summary}
SEOdescription: ${SEOdescription || summary}
keywords:
${allKeywords.map(keyword => `- ${keyword}`).join('\n')}
technologies:
${(technologies || []).map(tech => `- ${tech}`).join('\n')}${githubUrl ? `
githubUrl: ${githubUrl}` : ''}${liveUrl ? `
liveUrl: ${liveUrl}` : ''}
startDate: ${projectStartDate}
endDate: ${projectEndDate}
tags:
${allTags.map(tag => `- ${tag.toLowerCase()}`).join('\n')}
---

${description}
`;

    // Create index.ts content matching existing project structure
    const indexTs = `import { ProjectProps } from '../../../types';
import { attributes, body } from './description.md?parsed';


const webImages = Object.entries(import.meta.glob('./images/web/*.webp', { eager: true, import: 'default' }))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url) as string[];
const fullImages = Object.entries(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url) as string[];
const sortedImages = webImages.length > 0 ? webImages : fullImages;



export default {
    ...attributes as object,
    description: body,
    images: sortedImages,
    imagesFull: fullImages,
} as ProjectProps;
`;

    return {
        descriptionPath: `${basePath}/description.md`,
        indexPath: `${basePath}/index.ts`,
        descriptionContent: descriptionMd,
        indexContent: indexTs,
        basePath,
    };
}
