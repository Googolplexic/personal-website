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

// Generate directory structure for projects/origami
export function generateProjectStructure(type, slug, title, description, technologies, images) {
    const basePath = `src/assets/${type}/${slug}`;

    // Create description.md content
    const descriptionMd = `# ${title}

${description}
`;

    // Create index.ts content
    const indexTs = `import { ${type === 'projects' ? 'Project' : 'OrigamiDesign'} } from '../..';

export const ${slug.replace(/-/g, '')}${type === 'projects' ? 'Project' : 'Design'}: ${type === 'projects' ? 'Project' : 'OrigamiDesign'} = {
  slug: '${slug}',
  title: '${title}',
  technologies: [${technologies.map(tech => `'${tech}'`).join(', ')}],
  images: [${images.map((img, i) => `'${basePath}/images/${i + 1}.${img.ext}'`).join(', ')}],
  featured: false,
};
`;

    return {
        descriptionPath: `${basePath}/description.md`,
        indexPath: `${basePath}/index.ts`,
        descriptionContent: descriptionMd,
        indexContent: indexTs,
        basePath,
    };
}
