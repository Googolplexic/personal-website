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
    const indexTs = `import { OrigamiProps } from '../../../../types';
import info from './info.md?raw';
import matter from 'front-matter';

interface OrigamiMetadata {
    title: string;
    date: string;
    description?: string;
    designer?: string;
}

// Load all images in this folder (excluding patterns)
const modelImages = Object.values(import.meta.glob('./*.{png,jpg,jpeg,webp}', { 
    eager: true, 
    import: 'default' 
}))
.filter((url: unknown) => !(url as string).includes('pattern'))
.sort((a, b) => (a as string).localeCompare(b as string)) as string[];

// Load crease pattern if it exists
const creasePatternModules = import.meta.glob('./*pattern*.{png,jpg,jpeg,webp}', { 
    eager: true, 
    import: 'default' 
});
const creasePattern = Object.values(creasePatternModules)[0] as string | undefined;

// Parse metadata from info.md
const { attributes } = matter<OrigamiMetadata>(info);

export default {
    title: attributes.title,
    description: attributes.description,
    date: attributes.date,
    startDate: attributes.date,
    designer: attributes.designer,
    modelImages,
    creasePattern,
    keywords: ['origami', 'paper art', attributes.title?.toLowerCase().replace(/\\s+/g, '-')].filter(Boolean),
    tags: ['origami', '${category === 'my-designs' ? 'my-design' : 'other-design'}']
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

    // Create index.ts content similar to be-square structure
    const indexTs = `import { ProjectProps } from '../../../types';
import description from './description.md?raw';
import matter from 'front-matter';

const sortedImages = Object.values(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];

const { attributes, body } = matter<ProjectProps>(description);

export default {
    ...attributes as object,
    description: body,
    images: sortedImages,
    slug: '${slug}',
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
