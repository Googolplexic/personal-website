import { useState, useEffect, useCallback, useRef } from 'react';
import { apiUrl, newIdempotencyKey } from '../../config/api';
import { marked } from 'marked';

/** How long the undo toast waits before a delete reaches the server */
const UNDO_MS = 5000;

interface EnhancedEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    path: string;
    type: 'project' | 'origami';
    category?: string;
    onSave?: () => void;
}

interface ImageFile {
    name: string;
    url: string;
}

interface PendingDelete {
    image: ImageFile;
    /** Where it sat in the list, so Undo puts it back in place */
    index: number;
    url: string;
}

const insertAt = <T,>(list: T[], index: number, item: T) => [...list.slice(0, index), item, ...list.slice(index)];

// Function to remove frontmatter from markdown content
const removeFrontmatter = (content: string): string => {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    return content.replace(frontmatterRegex, '').trim();
};

export function EnhancedEditModal({ isOpen, onClose, title, path, type, category, onSave }: EnhancedEditModalProps) {
    const [content, setContent] = useState('');
    const [currentSha, setCurrentSha] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    const [markdownFiles, setMarkdownFiles] = useState<{ name: string; type: string }[]>([]);
    const [images, setImages] = useState<ImageFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'images'>('edit');
    const [renamingImage, setRenamingImage] = useState<string | null>(null);
    const [newImageName, setNewImageName] = useState('');
    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
    const pendingDeleteRef = useRef<{ pending: PendingDelete; timer: number } | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchFiles = async () => {
            try {

                const url = type === 'project'
                    ? apiUrl(`/files?path=project/${path}`)
                    : apiUrl(`/files?path=origami/${category}/${path}`);

                const response = await fetch(url, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const fileData = await response.json();
                    const fileList = fileData.files || [];

                    // Filter markdown files and set appropriate default
                    const mdFiles = fileList.filter((file: { name: string; type: string }) => file.name && file.name.endsWith('.md'));
                    setMarkdownFiles(mdFiles);
                    if (mdFiles.length > 0) {
                        // For origami, prefer info.md; for projects, prefer description.md
                        const preferredFile = type === 'project'
                            ? mdFiles.find((f: { name: string; type: string }) => f.name === 'description.md') || mdFiles[0]
                            : mdFiles.find((f: { name: string; type: string }) => f.name === 'info.md') || mdFiles[0];
                        setSelectedFile(preferredFile.name);
                    }

                    // Filter image files
                    const imageFiles = fileList.filter((file: { name: string; type: string }) =>
                        file.name && file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                    );

                    // Create image objects with URLs
                    const imageObjects = imageFiles.map((file: { name: string; type: string }) => {
                        // Create API URL for fetching image data, not for direct display
                        let imageApiUrl;
                        if (type === 'project') {
                            // For projects, file.name already includes "images/" prefix from the API
                            imageApiUrl = apiUrl(`/images?path=project/${path}&file=${file.name}`);
                        } else {
                            imageApiUrl = apiUrl(`/images?path=origami/${category}/${path}&file=${file.name}`);
                        }
                        return {
                            name: file.name,
                            apiUrl: imageApiUrl, // For fetching data
                            url: null as string | null // Will be set later with base64 data
                        };
                    });

                    // Load image data and convert to data URLs
                    const loadImagePromises = imageObjects.map(async (imageObj: { name: string; apiUrl: string; url: string | null }) => {
                        try {
                            const response = await fetch(imageObj.apiUrl, {
                                credentials: 'include'
                            });
                            if (response.ok) {
                                const data = await response.json();

                                // Determine MIME type from file extension
                                const fileName = imageObj.name.toLowerCase();
                                console.log('Processing image file:', fileName);

                                let mimeType = 'image/jpeg'; // default
                                if (fileName.endsWith('.png')) mimeType = 'image/png';
                                else if (fileName.endsWith('.gif')) mimeType = 'image/gif';
                                else if (fileName.endsWith('.webp')) mimeType = 'image/webp';
                                else if (fileName.endsWith('.svg')) mimeType = 'image/svg+xml';
                                else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';

                                console.log('Detected MIME type:', mimeType, 'for file:', fileName);

                                // Ensure base64 data is clean (no extra encoding)
                                const base64Data = data.content;
                                console.log('Image data for', imageObj.name, ':', base64Data.substring(0, 50) + '...');

                                // Convert base64 to data URL
                                imageObj.url = `data:${mimeType};base64,${base64Data}`;
                            } else {
                                console.error('Failed to fetch image:', imageObj.name, 'Status:', response.status);
                            }
                        } catch (error) {
                            console.error('Failed to load image:', imageObj.name, error);
                        }
                        return imageObj;
                    });

                    const loadedImages = await Promise.all(loadImagePromises);
                    setImages(loadedImages);
                }
            } catch (error) {
                console.error('Failed to fetch files:', error);
            }
        };

        void fetchFiles();
    }, [isOpen, path, type, category]);

    useEffect(() => {
        if (!selectedFile) return;

        const fetchContent = async () => {
            setLoading(true);
            setError('');
            try {

                const url = type === 'project'
                    ? apiUrl(`/content?path=project/${path}&file=${selectedFile}`)
                    : apiUrl(`/content?path=origami/${category}/${path}&file=${selectedFile}`);

                const response = await fetch(url, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setContent(data.content);
                    setCurrentSha(data.sha);
                } else {
                    setError('Failed to load file content');
                }
            } catch (error) {
                setError('Failed to load file content');
                console.error('Failed to fetch content:', error);
            } finally {
                setLoading(false);
            }
        };

        void fetchContent();
    }, [selectedFile, path, type, category]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {

            const url = type === 'project'
                ? apiUrl(`/content?path=project/${path}&file=${selectedFile}`)
                : apiUrl(`/content?path=origami/${category}/${path}&file=${selectedFile}`);

            const response = await fetch(url, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: content,
                    sha: currentSha // Use the SHA we fetched when loading content
                })
            });

            if (response.ok) {
                // Update the SHA after successful save
                const responseData = await response.json();
                if (responseData.sha) {
                    setCurrentSha(responseData.sha);
                }
                onSave?.();
                // Don't close automatically, let user continue editing
            } else {
                setError('Failed to save file');
            }
        } catch (error) {
            setError('Failed to save file');
            console.error('Failed to save content:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        // Otherwise the refreshed list below could bring back an image that's about to be deleted
        await flushPendingDelete();
        try {
            // Find the highest existing numbered index across current images
            let maxIndex = 0;
            for (const img of images) {
                const baseName = img.name.split('/').pop() || '';
                const match = baseName.match(/^(\d+)-/);
                if (match) maxIndex = Math.max(maxIndex, parseInt(match[1], 10));
            }

            // Upload each file individually using the images API
            const fileArr = Array.from(files);
            for (let i = 0; i < fileArr.length; i++) {
                const file = fileArr[i];
                // Convert file to base64
                const base64Data = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        resolve(result); // This includes "data:image/...;base64,..."
                    };
                    reader.readAsDataURL(file);
                });

                // Build a properly formatted filename
                const ext = file.name.split('.').pop() || 'jpg';
                let renamedFile: string;

                if (type === 'project') {
                    // Projects: NN-descriptive-name.ext
                    const cleanName = file.name
                        .replace(/\.[^.]+$/, '')
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                    renamedFile = `${String(maxIndex + i + 1).padStart(2, '0')}-${cleanName}.${ext}`;
                } else {
                    // Origami: pattern → slug-pattern.ext, regular → NN-slug.ext
                    const isPattern = file.name.toLowerCase().includes('pattern');
                    if (isPattern) {
                        renamedFile = `${path}-pattern.${ext}`;
                    } else {
                        renamedFile = `${String(maxIndex + i + 1).padStart(2, '0')}-${path}.${ext}`;
                    }
                }

                // Upload using the images API
                const uploadUrl = type === 'project'
                    ? apiUrl(`/images?path=project/${path}`)
                    : apiUrl(`/images?path=origami/${category}/${path}`);

                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Idempotency-Key': newIdempotencyKey(),
                    },
                    body: JSON.stringify({
                        imageData: base64Data,
                        fileName: renamedFile
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }
            }

            // Refresh the image list by re-triggering the useEffect
            const refreshUrl = type === 'project'
                ? apiUrl(`/files?path=project/${path}`)
                : apiUrl(`/files?path=origami/${category}/${path}`);

            const refreshResponse = await fetch(refreshUrl, {
                credentials: 'include'
            });

            if (refreshResponse.ok) {
                const fileData = await refreshResponse.json();
                const fileList = fileData.files || [];
                const imageFiles = fileList.filter((file: { name: string; type: string }) =>
                    file.name && file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                );

                const imageObjects = imageFiles.map((file: { name: string; type: string }) => {
                    let imageApiUrl;
                    if (type === 'project') {
                        // For projects, file.name already includes "images/" prefix from the API
                        imageApiUrl = apiUrl(`/images?path=project/${path}&file=${file.name}`);
                    } else {
                        imageApiUrl = apiUrl(`/images?path=origami/${category}/${path}&file=${file.name}`);
                    }
                    return {
                        name: file.name,
                        apiUrl: imageApiUrl,
                        url: null as string | null
                    };
                });

                // Load image data and convert to data URLs
                const loadImagePromises = imageObjects.map(async (imageObj: { name: string; apiUrl: string; url: string | null }) => {
                    try {
                        const response = await fetch(imageObj.apiUrl, {
                            credentials: 'include'
                        });
                        if (response.ok) {
                            const data = await response.json();

                            // Determine MIME type from file extension
                            const fileName = imageObj.name.toLowerCase();
                            let mimeType = 'image/jpeg'; // default
                            if (fileName.endsWith('.png')) mimeType = 'image/png';
                            else if (fileName.endsWith('.gif')) mimeType = 'image/gif';
                            else if (fileName.endsWith('.webp')) mimeType = 'image/webp';
                            else if (fileName.endsWith('.svg')) mimeType = 'image/svg+xml';
                            else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';

                            imageObj.url = `data:${mimeType};base64,${data.content}`;
                        }
                    } catch (error) {
                        console.error('Failed to load image:', imageObj.name, error);
                    }
                    return imageObj;
                });

                const loadedImages = await Promise.all(loadImagePromises);
                setImages(loadedImages);
            }

        } catch (error) {
            setError('Failed to upload images');
            console.error('Failed to upload images:', error);
        } finally {
            setUploading(false);
            // Reset the input
            event.target.value = '';
        }
    };

    const imageFileUrl = (name: string) => type === 'project'
        ? apiUrl(`/images?path=project/${path}&file=${name}`)
        : apiUrl(`/images?path=origami/${category}/${path}&file=${name}`);

    // Deleting hides the image at once and waits UNDO_MS before telling the server,
    // so a misclick can be taken back from the toast
    const commitDelete = useCallback(async ({ image, index, url }: PendingDelete) => {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Idempotency-Key': newIdempotencyKey() },
            });
            if (!response.ok) throw new Error(`Delete answered ${response.status}`);
        } catch (error) {
            console.error('Failed to delete image:', error);
            setError(`Couldn't delete ${image.name}, so it's back in the list.`);
            setImages(prev => prev.some(img => img.name === image.name) ? prev : insertAt(prev, index, image));
        }
    }, []);

    /** Sends the delete that's waiting out its undo time, now. */
    const flushPendingDelete = useCallback(() => {
        const current = pendingDeleteRef.current;
        if (!current) return Promise.resolve();
        clearTimeout(current.timer);
        pendingDeleteRef.current = null;
        setPendingDelete(null);
        return commitDelete(current.pending);
    }, [commitDelete]);

    // Closing the editor (or leaving the page) doesn't cancel a delete the toast was counting down
    useEffect(() => {
        if (!isOpen) void flushPendingDelete();
    }, [isOpen, flushPendingDelete]);
    useEffect(() => () => void flushPendingDelete(), [flushPendingDelete]);

    const handleImageDelete = (imageName: string) => {
        const index = images.findIndex(img => img.name === imageName);
        if (index === -1) return;
        void flushPendingDelete();
        const pending = { image: images[index], index, url: imageFileUrl(imageName) };
        setImages(prev => prev.filter(img => img.name !== imageName));
        pendingDeleteRef.current = { pending, timer: window.setTimeout(() => void flushPendingDelete(), UNDO_MS) };
        setPendingDelete(pending);
    };

    const undoDelete = () => {
        const current = pendingDeleteRef.current;
        if (!current) return;
        clearTimeout(current.timer);
        pendingDeleteRef.current = null;
        setPendingDelete(null);
        setImages(prev => insertAt(prev, current.pending.index, current.pending.image));
    };

    // Renaming shows the new name right away and puts the old one back if the server refuses
    const handleImageRename = async (oldName: string, newName: string) => {
        if (!newName.trim() || newName === oldName) {
            return;
        }

        const cleanNewName = type === 'project' && newName.startsWith('images/')
            ? newName.substring(7)
            : newName;
        const displayNewName = type === 'project' && !cleanNewName.startsWith('images/')
            ? `images/${cleanNewName}`
            : cleanNewName;
        const renameTo = (from: string, to: string) => setImages(prev => prev.map(img =>
            img.name === from ? { ...img, name: to } : img
        ));
        const fail = (message: string) => {
            renameTo(displayNewName, oldName);
            setError(message);
        };

        renameTo(oldName, displayNewName);
        setRenamingImage(null);
        setNewImageName('');
        const actionKey = newIdempotencyKey();

        try {
            // Step 1: Get the existing image data
            const getUrl = type === 'project'
                ? apiUrl(`/images?path=project/${path}&file=${oldName}`)
                : apiUrl(`/images?path=origami/${category}/${path}&file=${oldName}`);

            const getResponse = await fetch(getUrl, {
                credentials: 'include'
            });

            if (!getResponse.ok) {
                fail('Failed to fetch image for renaming');
                return;
            }

            const imageData = await getResponse.json();

            // Step 2: Upload with new name (without the images/ prefix for projects)
            const uploadUrl = type === 'project'
                ? apiUrl(`/images?path=project/${path}`)
                : apiUrl(`/images?path=origami/${category}/${path}`);

            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': `${actionKey}-copy`,
                },
                body: JSON.stringify({
                    imageData: `data:image/jpeg;base64,${imageData.content}`, // Ensure proper format
                    fileName: cleanNewName
                })
            });

            if (!uploadResponse.ok) {
                fail('Failed to upload renamed image');
                return;
            }

            // Step 3: Delete old image. The copy exists by now, so the new name stays either way.
            const deleteResponse = await fetch(getUrl, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Idempotency-Key': `${actionKey}-remove` },
            });

            if (!deleteResponse.ok) {
                setError(`Renamed, but the old copy (${oldName}) is still there. Delete it to tidy up.`);
            }
        } catch (error) {
            fail('Failed to rename image');
            console.error('Failed to rename image:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="admin-modal">
                <div className="admin-modal-panel">
                    <div className="flex justify-between items-start gap-4 px-5 py-4 md:px-6 border-b border-line shrink-0">
                        <div className="min-w-0">
                            <h2 className="admin-title text-[clamp(1.5rem,4vw,2rem)] truncate">
                                {title}
                            </h2>
                            {activeTab === 'edit' && (
                                <div className="flex items-center gap-4 mt-2">
                                    <label className="text-sm text-ink-faint">File:</label>
                                    <select
                                        value={selectedFile}
                                        onChange={(e) => setSelectedFile(e.target.value)}
                                        className="admin-select w-auto text-sm px-2 py-1"
                                        title="Select markdown file to edit"
                                    >
                                        {markdownFiles.map(file => (
                                            <option key={file.name} value={file.name}>{file.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="admin-link shrink-0"
                            aria-label="Close editor"
                        >
                            Close
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-line shrink-0">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-1 py-3 text-[0.68rem] tracking-[0.14em] uppercase transition-colors ${activeTab === 'edit'
                                ? 'border-b border-gold text-gold'
                                : 'text-ink-faint hover:text-ink-muted'
                                }`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`px-1 py-3 text-[0.68rem] tracking-[0.14em] uppercase transition-colors ${activeTab === 'images'
                                ? 'border-b border-gold text-gold'
                                : 'text-ink-faint hover:text-ink-muted'
                                }`}
                        >
                            Images ({images.length})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {error && (
                            <div className="border border-red-500/20 bg-red-500/10 rounded-sm p-3 m-4">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}                        {activeTab === 'edit' ? (
                            <div className="h-full p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-ink-faint">Loading markdown content...</div>
                                    </div>
                                ) : (
                                    <div className="admin-split">
                                        <div className="flex flex-col min-h-64 md:min-h-0 md:h-full">
                                            <p className="gallery-overline mb-2">
                                                Markdown
                                            </p>
                                            <textarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                className="flex-1 p-4 border border-line rounded-sm bg-canvas text-ink font-mono text-sm resize-none focus:border-gold focus:outline-hidden"
                                                placeholder="Enter your markdown content here..."
                                            />
                                        </div>

                                        {/* Preview */}
                                        <div className="flex flex-col min-h-64 md:min-h-0 md:h-full">
                                            <p className="gallery-overline mb-2">
                                                Preview
                                            </p>
                                            <div className="flex-1 p-4 border border-line rounded-sm bg-canvas overflow-y-auto">
                                                <div className="max-w-none text-sm markdown-preview text-left">
                                                    {content ? (
                                                        <div
                                                            className="rendered-markdown"
                                                            dangerouslySetInnerHTML={{
                                                                __html: marked(removeFrontmatter(content), {
                                                                    breaks: true,
                                                                    gfm: true
                                                                })
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="text-ink-faint italic">
                                                            Markdown preview will appear here...
                                                        </p>
                                                    )}
                                                </div>
                                                <style>{`
                                                    .markdown-preview { text-align: left !important; }
                                                    .markdown-preview * { text-align: left !important; }
                                                    .markdown-preview h1 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem 0; text-align: left; color: var(--color-ink); }
                                                    .markdown-preview h2 { font-size: 1.25rem; font-weight: bold; margin: 0.75rem 0 0.5rem 0; text-align: left; color: var(--color-ink); }
                                                    .markdown-preview h3 { font-size: 1.1rem; font-weight: bold; margin: 0.5rem 0 0.25rem 0; text-align: left; color: var(--color-ink); }
                                                    .markdown-preview p { margin: 0.5rem 0; line-height: 1.5; text-align: left; color: var(--color-ink-muted); }
                                                    .markdown-preview ul, .markdown-preview ol { margin: 0.5rem 0; padding-left: 1.5rem; text-align: left; color: var(--color-ink-muted); }
                                                    .markdown-preview li { margin: 0.25rem 0; text-align: left; }
                                                    .markdown-preview code { 
                                                        background: rgba(255, 255, 255, 0.06); 
                                                        color: var(--color-ink); 
                                                        padding: 0.125rem 0.25rem; 
                                                        border-radius: 0.25rem; 
                                                        font-family: 'Monaco', 'Menlo', 'PT Sans Mono', monospace; 
                                                        font-size: 0.875em;
                                                    }
                                                    .markdown-preview pre { 
                                                        background: var(--color-surface-raised); 
                                                        border: 1px solid var(--color-line);
                                                        padding: 0.75rem; 
                                                        border-radius: 0.5rem; 
                                                        overflow-x: auto; 
                                                        margin: 0.5rem 0; 
                                                        text-align: left;
                                                        color: var(--color-ink);
                                                    }
                                                    .markdown-preview pre code { 
                                                        background: transparent; 
                                                        padding: 0; 
                                                        color: inherit;
                                                    }
                                                    .markdown-preview blockquote { border-left: 3px solid var(--color-line); padding-left: 1rem; margin: 0.5rem 0; color: var(--color-ink-faint); text-align: left; }
                                                    .markdown-preview a { color: var(--color-gold); text-decoration: underline; }
                                                    .markdown-preview img { max-width: 100%; height: auto; margin: 0.5rem 0; }
                                                    .markdown-preview table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
                                                    .markdown-preview th, .markdown-preview td { border: 1px solid var(--color-line); padding: 0.5rem; text-align: left; color: var(--color-ink-muted); }
                                                    .markdown-preview th { background: var(--color-surface-raised); font-weight: bold; color: var(--color-ink); }
                                                `}</style>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full p-6 overflow-y-auto">
                                {/* Image Management */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <p className="gallery-overline">
                                            Upload
                                        </p>
                                        <label className="admin-link cursor-pointer">
                                            {uploading ? 'Uploading...' : 'Choose Files'}
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-ink-faint">
                                        Supported formats: JPG, PNG, GIF, WebP, SVG
                                    </p>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {images.map((image) => (
                                        <div key={image.name} className="border border-line rounded-lg p-3">
                                            <div className="bg-surface-raised rounded-sm mb-2 overflow-hidden">
                                                <img
                                                    src={image.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5QzEwLjMzIDkgOSAxMC4zMyA5IDEyUzEwLjMzIDE1IDEyIDE1IDE1IDEzLjY3IDE1IDEyUzEzLjY3IDkgMTIgOVpNMTIgMTNDMTEuNDUgMTMgMTEgMTIuNTUgMTEgMTJTMTEuNDUgMTEgMTIgMTFTMTMgMTEuNDUgMTMgMTJTMTIuNTUgMTMgMTIgMTNaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
                                                    alt={image.name}
                                                    className="w-full h-auto object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5QzEwLjMzIDkgOSAxMC4zMyA5IDEyUzEwLjMzIDE1IDEyIDE1IDE1IDEzLjY3IDE1IDEyUzEzLjY3IDkgMTIgOVpNMTIgMTNDMTEuNDUgMTMgMTEgMTIuNTUgMTEgMTJTMTEuNDUgMTEgMTIgMTFTMTMgMTEuNDUgMTMgMTJTMTIuNTUgMTMgMTIgMTNaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                                                    }}
                                                />
                                            </div>
                                            {renamingImage === image.name ? (
                                                <div className="mb-2">
                                                    <input
                                                        type="text"
                                                        value={newImageName}
                                                        onChange={(e) => setNewImageName(e.target.value)}
                                                        placeholder="Enter new filename"
                                                        className="admin-input text-xs px-2 py-1 mb-2"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                void handleImageRename(image.name, newImageName);
                                                            } else if (e.key === 'Escape') {
                                                                setRenamingImage(null);
                                                                setNewImageName('');
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleImageRename(image.name, newImageName)}
                                                            className="flex-1 text-xs border border-green-500/30 text-green-400 hover:bg-green-500/10 px-2 py-1 rounded-sm transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRenamingImage(null);
                                                                setNewImageName('');
                                                            }}
                                                            className="flex-1 text-xs border border-line text-ink-muted hover:text-ink px-2 py-1 rounded-sm transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-ink-faint truncate mb-2" title={image.name}>
                                                    {image.name}
                                                </p>
                                            )}
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setRenamingImage(image.name);
                                                        const editName = type === 'project' && image.name.startsWith('images/')
                                                            ? image.name.substring(7)
                                                            : image.name;
                                                        setNewImageName(editName);
                                                    }}
                                                    className="admin-link"
                                                >
                                                    Rename
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageDelete(image.name)}
                                                    className="admin-link"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>                                {images.length === 0 && (
                                    <div className="text-center py-12 text-ink-faint">
                                        <div className="text-4xl mb-4">🖼️</div>
                                        <p>No images found. Upload some images to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center p-6 border-t border-line shrink-0">
                        <div className="text-sm text-ink-faint">
                            {activeTab === 'edit' && selectedFile && (
                                <>
                                    Editing: <span className="font-mono">{selectedFile}</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-ink-muted hover:text-ink border border-line rounded-sm transition-colors"
                            >
                                Close
                            </button>
                            {activeTab === 'edit' && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="px-4 py-2 bg-gold hover:opacity-90 disabled:opacity-40 text-canvas rounded-sm transition-opacity"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {pendingDelete && (
                <div
                    key={pendingDelete.image.name}
                    role="status"
                    className="admin-toast flex items-center gap-5 max-w-[calc(100vw-2rem)] pl-4 pr-3 min-h-12 overflow-hidden border border-solid border-line-strong bg-canvas-raised shadow-[0_16px_48px_rgb(0_0_0/0.55)] text-sm text-ink"
                >
                    <span className="min-w-0 truncate">
                        Deleted <span className="font-mono text-xs text-ink-muted">{pendingDelete.image.name}</span>
                    </span>
                    <button type="button" onClick={undoDelete} className="admin-link shrink-0 min-h-11 text-gold">
                        Undo
                    </button>
                    <span
                        aria-hidden="true"
                        className="admin-toast-countdown absolute left-0 bottom-0 w-full h-px bg-gold"
                        style={{ animationDuration: `${UNDO_MS}ms` }}
                    />
                </div>
            )}
        </>
    );
}

