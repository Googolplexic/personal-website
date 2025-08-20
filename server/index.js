/**
 * Personal Website Admin Server
 * 
 * This server provides admin functionality for managing projects and origami content,
 * including file uploads, content editing, and image management.
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import cors from 'cors';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp uploads directory exists
fs.ensureDirSync(path.join(__dirname, 'temp-uploads'));

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces by default

// Enable CORS for frontend
app.use(cors({
    origin: [
        'http://localhost:5173', // Vite dev server
        'http://localhost:4173', // Vite preview
        /^https?:\/\/.*\.vercel\.app$/, // Vercel deployments
        /^https?:\/\/.*\.netlify\.app$/, // Netlify deployments
        /^https?:\/\/localhost:\d+$/, // Any localhost port
        /^https?:\/\/127\.0\.0\.1:\d+$/, // Any 127.0.0.1 port
        process.env.FRONTEND_URL // Custom frontend URL from environment
    ].filter(Boolean), // Remove undefined values
    credentials: true
}));

app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// Simple session storage (in production, use proper session management)
const sessions = new Map();

// Authentication middleware
const requireAuth = (req, res, next) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Login endpoint
app.post('/api/login', (req, res) => {
    const { password } = req.body;

    // Simple password check (in production, use proper hashing)
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
        const sessionId = crypto.randomUUID();
        sessions.set(sessionId, { createdAt: Date.now() });
        res.json({ sessionId });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
        sessions.delete(sessionId);
    }
    res.json({ success: true });
});

// Session validation endpoint
app.get('/api/validate-session', (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId && sessions.has(sessionId)) {
        res.json({ valid: true });
    } else {
        res.status(401).json({ valid: false, error: 'Invalid session' });
    }
});

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { type, slug } = req.body;

        // If no type specified, this is likely a new project/origami creation
        // We'll create a temp directory and move files later
        if (!type || !slug) {
            const tempPath = path.join(__dirname, 'temp-uploads');
            fs.ensureDirSync(tempPath);
            cb(null, tempPath);
            return;
        }

        let uploadPath;

        if (type === 'project') {
            uploadPath = path.join(__dirname, '../src/assets/projects', slug, 'images');
        } else if (type === 'origami') {
            const category = req.body.category || 'my-designs';
            uploadPath = path.join(__dirname, '../src/assets/origami', category, slug);
        } else {
            // Fallback to temp directory
            uploadPath = path.join(__dirname, 'temp-uploads');
        }

        // Ensure directory exists
        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const { type, slug } = req.body;
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);

        // If no type specified, just use timestamp for temp files
        if (!type || !slug) {
            const timestamp = Date.now();
            cb(null, `${timestamp}-${file.originalname}`);
            return;
        }

        // Get the target directory to check existing files
        let targetDir;
        if (type === 'project') {
            targetDir = path.join(__dirname, '../src/assets/projects', slug);
        } else if (type === 'origami') {
            const category = req.body.category || 'my-designs';
            targetDir = path.join(__dirname, '../src/assets/origami', category, slug);
        } else {
            // Fallback filename for unknown types
            const timestamp = Date.now();
            cb(null, `${timestamp}-${file.originalname}`);
            return;
        }

        if (type === 'origami') {
            // For origami, check if it's a crease pattern
            if (baseName.toLowerCase().includes('pattern') || file.originalname.toLowerCase().includes('pattern')) {
                // Use format: [slug]-pattern.[ext]
                cb(null, `${slug}-pattern${ext}`);
            } else {
                // For model images, get the next number by checking existing files
                const existingFiles = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
                const numberedFiles = existingFiles.filter(f => f.match(/^\d{2}-/));
                const numbers = numberedFiles.map(f => parseInt(f.substring(0, 2))).filter(n => !isNaN(n));
                const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

                cb(null, `${String(nextNumber).padStart(2, '0')}-${slug}${ext}`);
            }
        } else if (type === 'project') {
            // For projects, get the next number by checking existing files
            const existingFiles = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
            const numberedFiles = existingFiles.filter(f => f.match(/^\d{2}-/));
            const numbers = numberedFiles.map(f => parseInt(f.substring(0, 2))).filter(n => !isNaN(n));
            const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

            const safeBaseName = baseName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
            cb(null, `${String(nextNumber).padStart(2, '0')}-${safeBaseName}${ext}`);
        } else {
            // Fallback to safe filename
            const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            cb(null, safeName);
        }
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Create project endpoint or add images to existing project
app.post('/api/projects', requireAuth, upload.array('images', 10), async (req, res) => {
    try {
        const {
            title,
            summary,
            description,
            technologies,
            githubUrl,
            liveUrl,
            startDate,
            endDate,
            tags,
            keywords,
            SEOdescription,
            slug,
            type // Added to distinguish between new project and image upload
        } = req.body;

        const projectPath = path.join(__dirname, '../src/assets/projects', slug);

        // If this is just an image upload to existing project
        if (type === 'project' && fs.existsSync(projectPath)) {
            // Move uploaded files from temp directory to project images directory
            if (req.files && req.files.length > 0) {
                const imagesDir = path.join(projectPath, 'images');
                await fs.ensureDir(imagesDir);

                // Get existing image count to continue numbering
                const existingImages = await fs.readdir(imagesDir);
                const imageCount = existingImages.filter(file =>
                    file.match(/^\d{2}-.*\.(jpg|jpeg|png|gif|webp|svg)$/i)
                ).length;

                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    const ext = path.extname(file.originalname);
                    const newFileName = `${String(imageCount + i + 1).padStart(2, '0')}-${path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-')}${ext}`;
                    const newPath = path.join(imagesDir, newFileName);

                    // Move file from temp location to final location
                    await fs.move(file.path, newPath);
                }
            }

            res.json({
                success: true,
                message: `Images uploaded to project: ${slug}`,
                imagesUploaded: req.files?.length || 0
            });
            return;
        }

        // Otherwise, create new project
        // Create project directory
        await fs.ensureDir(projectPath);
        await fs.ensureDir(path.join(projectPath, 'images'));

        // Create description.md with frontmatter
        const frontmatter = {
            title,
            summary,
            SEOdescription,
            keywords: JSON.parse(keywords || '[]'),
            technologies: JSON.parse(technologies || '[]'),
            githubUrl,
            liveUrl: liveUrl || undefined,
            startDate,
            endDate: endDate || undefined,
            tags: JSON.parse(tags || '[]')
        };

        const descriptionContent = `---
${Object.entries(frontmatter)
                .filter(([key, value]) => value !== undefined && value !== '')
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `${key}:\n${value.map(item => `- ${item}`).join('\n')}`;
                    }
                    return `${key}: ${value}`;
                })
                .join('\n')}
---

${description}`;

        await fs.writeFile(path.join(projectPath, 'description.md'), descriptionContent);

        // Create index.ts file
        const indexContent = `import { ProjectProps } from '../../../types';
import description from './description.md?raw';
import matter from 'front-matter';

const sortedImages = Object.values(import.meta.glob('./images/*.(png|jpg|jpeg)', { eager: true, import: 'default' }))
    .sort((a, b) => (a as string).localeCompare(b as string)) as string[];

const { attributes, body } = matter<ProjectProps>(description);

export default {
    ...attributes as object,
    description: body,
    images: sortedImages,
} as ProjectProps;`;

        await fs.writeFile(path.join(projectPath, 'index.ts'), indexContent);

        // Move uploaded files from temp directory to project images directory
        if (req.files && req.files.length > 0) {
            const imagesDir = path.join(projectPath, 'images');

            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const ext = path.extname(file.originalname);
                const newFileName = `${String(i + 1).padStart(2, '0')}-${path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-')}${ext}`;
                const newPath = path.join(imagesDir, newFileName);

                // Move file from temp location to final location
                await fs.move(file.path, newPath);
            }
        }

        res.json({ success: true, slug });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Create origami endpoint or add images to existing origami
app.post('/api/origami', requireAuth, upload.array('images', 10), async (req, res) => {
    try {
        const {
            title,
            description,
            designer,
            date,
            category,
            slug,
            type // Added to distinguish between new origami and image upload
        } = req.body;

        const origamiPath = path.join(__dirname, '../src/assets/origami', category, slug);

        // If this is just an image upload to existing origami
        if (type === 'origami' && fs.existsSync(origamiPath)) {
            // Move uploaded files from temp directory to origami directory
            if (req.files && req.files.length > 0) {
                await fs.ensureDir(origamiPath);

                // Get existing image count to continue numbering
                const existingImages = await fs.readdir(origamiPath);
                const imageCount = existingImages.filter(file =>
                    file.match(/^\d{2}-.*\.(jpg|jpeg|png|gif|webp|svg)$/i)
                ).length;

                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    const ext = path.extname(file.originalname);
                    const newFileName = `${String(imageCount + i + 1).padStart(2, '0')}-${path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-')}${ext}`;
                    const newPath = path.join(origamiPath, newFileName);

                    // Move file from temp location to final location
                    await fs.move(file.path, newPath);
                }
            }

            res.json({
                success: true,
                message: `Images uploaded to origami: ${slug}`,
                imagesUploaded: req.files?.length || 0
            });
            return;
        }

        // Otherwise, create new origami
        // Create origami directory
        await fs.ensureDir(origamiPath);

        // Create info.md with frontmatter
        const frontmatter = {
            title,
            date,
            description: description || undefined,
            designer: designer || undefined
        };

        const infoContent = `---
${Object.entries(frontmatter)
                .filter(([key, value]) => value !== undefined && value !== '')
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')}
---`;

        await fs.writeFile(path.join(origamiPath, 'info.md'), infoContent);

        // Create index.ts file
        const indexContent = `import { OrigamiProps } from '../../../../types';
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
    tags: ['origami', '${category}'],
    slug: '${slug}',
    type: 'origami' as const,
    category: '${category}' as const
} as OrigamiProps;`;

        await fs.writeFile(path.join(origamiPath, 'index.ts'), indexContent);

        // Move uploaded files from temp directory to origami directory
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const ext = path.extname(file.originalname);
                const newFileName = `${String(i + 1).padStart(2, '0')}-${path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-')}${ext}`;
                const newPath = path.join(origamiPath, newFileName);

                // Move file from temp location to final location
                await fs.move(file.path, newPath);
            }
        }

        res.json({ success: true, slug });
    } catch (error) {
        console.error('Error creating origami:', error);
        res.status(500).json({ error: 'Failed to create origami' });
    }
});

// Get existing content for editing
app.get('/api/projects', requireAuth, async (req, res) => {
    try {
        const projectsPath = path.join(__dirname, '../src/assets/projects');
        const folders = await fs.readdir(projectsPath);
        const projects = folders.filter(folder => folder !== 'template' && folder !== 'index.ts');
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.get('/api/origami', requireAuth, async (req, res) => {
    try {
        const myDesignsPath = path.join(__dirname, '../src/assets/origami/my-designs');
        const otherDesignsPath = path.join(__dirname, '../src/assets/origami/other-designs');

        const myDesignsFolders = await fs.readdir(myDesignsPath);
        const myDesigns = myDesignsFolders.filter(folder => folder !== 'template' && folder !== 'index.ts');

        const otherDesignsFolders = await fs.readdir(otherDesignsPath);
        const otherDesigns = otherDesignsFolders.filter(folder => folder !== 'template' && folder !== 'index.ts');

        res.json({ myDesigns, otherDesigns });
    } catch (error) {
        console.error('Error fetching origami:', error);
        res.status(500).json({ error: 'Failed to fetch origami' });
    }
});

// Get files for a specific project or origami
app.get('/api/files/:type/:category?/:slug?', requireAuth, async (req, res) => {
    try {
        const { type, category, slug } = req.params;
        let targetPath;

        if (type === 'project') {
            targetPath = path.join(__dirname, '../src/assets/projects', category); // category is actually slug for projects
        } else if (type === 'origami') {
            targetPath = path.join(__dirname, '../src/assets/origami', category, slug);
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        if (!fs.existsSync(targetPath)) {
            return res.json([]);
        }

        const files = await fs.readdir(targetPath, { withFileTypes: true });
        const fileList = [];

        for (const file of files) {
            if (file.isDirectory()) {
                // For directories, list their contents too
                if (file.name === 'images') {
                    const imagePath = path.join(targetPath, file.name);
                    const imageFiles = await fs.readdir(imagePath);
                    fileList.push(`${file.name}/`);
                    imageFiles.forEach(img => {
                        fileList.push(`${file.name}/${img}`);
                    });
                } else {
                    fileList.push(`${file.name}/`);
                }
            } else {
                fileList.push(file.name);
            }
        }

        res.json(fileList);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Get content of a specific file
app.get('/api/content/:type/:category?/:slug?/:filename', requireAuth, async (req, res) => {
    try {
        const { type, category, slug, filename } = req.params;
        let targetPath;

        if (type === 'project') {
            targetPath = path.join(__dirname, '../src/assets/projects', category, filename); // category is actually slug for projects
        } else if (type === 'origami') {
            targetPath = path.join(__dirname, '../src/assets/origami', category, slug, filename);
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = await fs.readFile(targetPath, 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Failed to read file' });
    }
});

// Update content of a specific file
app.put('/api/content/:type/:category?/:slug?/:filename', requireAuth, async (req, res) => {
    try {
        const { type, category, slug, filename } = req.params;
        let targetPath;

        if (type === 'project') {
            targetPath = path.join(__dirname, '../src/assets/projects', category, filename); // category is actually slug for projects
        } else if (type === 'origami') {
            targetPath = path.join(__dirname, '../src/assets/origami', category, slug, filename);
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        // Get the content from the request body
        const content = req.body;

        // Ensure the directory exists
        await fs.ensureDir(path.dirname(targetPath));

        // Write the file
        await fs.writeFile(targetPath, content, 'utf8');

        res.json({ success: true });
    } catch (error) {
        console.error('Error writing file:', error);
        res.status(500).json({ error: 'Failed to write file' });
    }
});

// Serve images for the admin interface
app.get('/api/images/:type/:category/:folder/:filename', (req, res) => {
    try {
        // Check authentication from query parameter or header
        const sessionId = req.query.auth || req.headers.authorization?.replace('Bearer ', '');
        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { type, category, folder, filename } = req.params;
        let imagePath;

        if (type === 'project') {
            // For projects: category is project slug, folder is 'images'
            imagePath = path.join(__dirname, '../src/assets/projects', category, folder, filename);
        } else if (type === 'origami') {
            // For origami: category is 'my-designs'/'other-designs', folder is design slug
            imagePath = path.join(__dirname, '../src/assets/origami', category, folder, filename);
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        console.log('Serving image from path:', imagePath);

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Serve the image
        res.sendFile(path.resolve(imagePath));
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ error: 'Failed to serve image' });
    }
});

// Delete image endpoint
app.delete('/api/images/:type/:category/:folder/:filename', (req, res) => {
    try {
        // Check authentication
        const sessionId = req.headers.authorization?.replace('Bearer ', '');
        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { type, category, folder, filename } = req.params;
        let imagePath;

        if (type === 'project') {
            // For projects: category is project slug, folder is 'images'
            imagePath = path.join(__dirname, '../src/assets/projects', category, folder, filename);
        } else if (type === 'origami') {
            // For origami: category is 'my-designs'/'other-designs', folder is design slug
            imagePath = path.join(__dirname, '../src/assets/origami', category, folder, filename);
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        console.log('Attempting to delete image at path:', imagePath);

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Delete the file
        fs.unlinkSync(imagePath);

        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// Rename image endpoint
app.put('/api/rename-image/:type/:category/:folder/:filename', (req, res) => {
    try {
        // Check authentication
        const sessionId = req.headers.authorization?.replace('Bearer ', '');
        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { type, category, folder, filename } = req.params;
        const { newName } = req.body;

        if (!newName) {
            return res.status(400).json({ error: 'New filename is required' });
        }

        let oldPath, newPath;

        if (type === 'project') {
            // For projects: category is project slug, folder is 'images'
            oldPath = path.join(__dirname, '../src/assets/projects', category, folder, filename);
            newPath = path.join(__dirname, '../src/assets/projects', category, folder, newName);
        } else if (type === 'origami') {
            // For origami: category is 'my-designs'/'other-designs', folder is design slug
            oldPath = path.join(__dirname, '../src/assets/origami', category, folder, filename);
            newPath = path.join(__dirname, '../src/assets/origami', category, folder, newName);
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        console.log('Attempting to rename image from:', oldPath, 'to:', newPath);

        // Check if old file exists
        if (!fs.existsSync(oldPath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Check if new filename already exists
        if (fs.existsSync(newPath)) {
            return res.status(400).json({ error: 'A file with that name already exists' });
        }

        // Rename the file
        fs.renameSync(oldPath, newPath);

        res.json({ success: true, message: 'Image renamed successfully' });
    } catch (error) {
        console.error('Error renaming image:', error);
        res.status(500).json({ error: 'Failed to rename image' });
    }
});

// Cleanup function for temp files
const cleanupTempFiles = async () => {
    try {
        const tempDir = path.join(__dirname, 'temp-uploads');
        const files = await fs.readdir(tempDir);
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = await fs.stat(filePath);

            // Delete files older than 1 hour
            if (stats.mtime.getTime() < oneHourAgo) {
                await fs.unlink(filePath);
                console.log('Cleaned up temp file:', file);
            }
        }
    } catch (error) {
        console.error('Error cleaning up temp files:', error);
    }
};

// Clean up temp files every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

app.listen(PORT, HOST, () => {
    console.log(`Admin server running on http://${HOST}:${PORT}`);
    console.log(`Admin server also accessible on http://localhost:${PORT}`);
    console.log(`Admin password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
});
