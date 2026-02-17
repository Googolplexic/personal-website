import { useState, useEffect } from 'react';
import { apiUrl } from '../../config/api';
import { marked } from 'marked';
import { Heading } from '../ui/base';

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

        fetchFiles();
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

        fetchContent();
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
                headers: {
                    'credentials': 'include',
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
        try {


            // Upload each file individually using the images API
            for (const file of Array.from(files)) {
                // Convert file to base64
                const base64Data = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        resolve(result); // This includes "data:image/...;base64,..."
                    };
                    reader.readAsDataURL(file);
                });

                // Upload using the images API
                const uploadUrl = type === 'project'
                    ? apiUrl(`/images?path=project/${path}`)
                    : apiUrl(`/images?path=origami/${category}/${path}`);

                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'credentials': 'include',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        imageData: base64Data,
                        fileName: file.name
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

    const handleImageDelete = async (imageName: string) => {
        if (!confirm(`Are you sure you want to delete ${imageName}?`)) {
            return;
        }

        try {


            // Use the same URL pattern as the images API
            const url = type === 'project'
                ? apiUrl(`/images?path=project/${path}&file=${imageName}`)
                : apiUrl(`/images?path=origami/${category}/${path}&file=${imageName}`);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'credentials': 'include'
                }
            });

            if (response.ok) {
                // Remove the image from the list
                setImages(prev => prev.filter(img => img.name !== imageName));
            } else {
                setError('Failed to delete image');
            }
        } catch (error) {
            setError('Failed to delete image');
            console.error('Failed to delete image:', error);
        }
    };

    const handleImageRename = async (oldName: string, newName: string) => {
        if (!newName.trim() || newName === oldName) {
            return;
        }

        try {


            // Step 1: Get the existing image data
            const getUrl = type === 'project'
                ? apiUrl(`/images?path=project/${path}&file=${oldName}`)
                : apiUrl(`/images?path=origami/${category}/${path}&file=${oldName}`);

            const getResponse = await fetch(getUrl, {
                credentials: 'include'
            });

            if (!getResponse.ok) {
                setError('Failed to fetch image for renaming');
                return;
            }

            const imageData = await getResponse.json();

            // Step 2: Upload with new name
            // For projects, ensure we keep the filename without images/ prefix for the API call
            const cleanNewName = type === 'project' && newName.startsWith('images/')
                ? newName.substring(7)
                : newName;

            const uploadUrl = type === 'project'
                ? apiUrl(`/images?path=project/${path}`)
                : apiUrl(`/images?path=origami/${category}/${path}`);

            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'credentials': 'include',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageData: `data:image/jpeg;base64,${imageData.content}`, // Ensure proper format
                    fileName: cleanNewName
                })
            });

            if (!uploadResponse.ok) {
                setError('Failed to upload renamed image');
                return;
            }

            // Step 3: Delete old image
            const deleteResponse = await fetch(getUrl, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!deleteResponse.ok) {
                setError('Failed to delete old image after rename');
                return;
            }

            // Step 4: Update the local state
            // For projects, the new name should include images/ prefix for display
            const displayNewName = type === 'project' && !cleanNewName.startsWith('images/')
                ? `images/${cleanNewName}`
                : cleanNewName;

            setImages(prev => prev.map(img =>
                img.name === oldName
                    ? { ...img, name: displayNewName }
                    : img
            ));

            // Reset rename state
            setRenamingImage(null);
            setNewImageName('');

        } catch (error) {
            setError('Failed to rename image');
            console.error('Failed to rename image:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)] flex-shrink-0">
                        <div>
                            <Heading level={3}>
                                Edit {title}
                            </Heading>
                            {activeTab === 'edit' && (
                                <div className="flex items-center gap-4 mt-2">
                                    <label className="text-sm text-[var(--color-text-tertiary)]">File:</label>
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
                            onClick={onClose}
                            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[var(--color-border)] flex-shrink-0">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'edit'
                                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]'
                                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                                }`}
                        >
                            📝 Edit Markdown
                        </button>
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'images'
                                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]'
                                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                                }`}
                        >
                            🖼️ Manage Images ({images.length})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {error && (
                            <div className="border border-red-500/20 bg-red-500/10 rounded p-3 m-4">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}                        {activeTab === 'edit' ? (
                            <div className="h-full p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-[var(--color-text-tertiary)]">Loading markdown content...</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-6 h-full">
                                        {/* Editor */}
                                        <div className="flex flex-col h-full">
                                            <Heading level={4} className="text-sm mb-2">
                                                Markdown Editor
                                            </Heading>
                                            <textarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                className="flex-1 p-4 border border-[var(--color-border)] rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-mono text-sm resize-none focus:border-[var(--color-accent)] focus:outline-none"
                                                placeholder="Enter your markdown content here..."
                                            />
                                        </div>

                                        {/* Preview */}
                                        <div className="flex flex-col h-full">
                                            <Heading level={4} className="text-sm mb-2">
                                                Preview (without frontmatter)
                                            </Heading>
                                            <div className="flex-1 p-4 border border-[var(--color-border)] rounded bg-[var(--color-bg-primary)] overflow-y-auto">
                                                <div className="prose dark:prose-invert max-w-none text-sm markdown-preview text-left">
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
                                                        <p className="text-[var(--color-text-tertiary)] italic">
                                                            Markdown preview will appear here...
                                                        </p>
                                                    )}
                                                </div>
                                                <style>{`
                                                    .markdown-preview { text-align: left !important; }
                                                    .markdown-preview * { text-align: left !important; }
                                                    .markdown-preview h1 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem 0; text-align: left; color: var(--color-text-primary); }
                                                    .markdown-preview h2 { font-size: 1.25rem; font-weight: bold; margin: 0.75rem 0 0.5rem 0; text-align: left; color: var(--color-text-primary); }
                                                    .markdown-preview h3 { font-size: 1.1rem; font-weight: bold; margin: 0.5rem 0 0.25rem 0; text-align: left; color: var(--color-text-primary); }
                                                    .markdown-preview p { margin: 0.5rem 0; line-height: 1.5; text-align: left; color: var(--color-text-secondary); }
                                                    .markdown-preview ul, .markdown-preview ol { margin: 0.5rem 0; padding-left: 1.5rem; text-align: left; color: var(--color-text-secondary); }
                                                    .markdown-preview li { margin: 0.25rem 0; text-align: left; }
                                                    .markdown-preview code { 
                                                        background: rgba(255, 255, 255, 0.06); 
                                                        color: var(--color-text-primary); 
                                                        padding: 0.125rem 0.25rem; 
                                                        border-radius: 0.25rem; 
                                                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                                                        font-size: 0.875em;
                                                    }
                                                    .markdown-preview pre { 
                                                        background: var(--color-bg-elevated); 
                                                        border: 1px solid var(--color-border);
                                                        padding: 0.75rem; 
                                                        border-radius: 0.5rem; 
                                                        overflow-x: auto; 
                                                        margin: 0.5rem 0; 
                                                        text-align: left;
                                                        color: var(--color-text-primary);
                                                    }
                                                    .markdown-preview pre code { 
                                                        background: transparent; 
                                                        padding: 0; 
                                                        color: inherit;
                                                    }
                                                    .markdown-preview blockquote { border-left: 3px solid var(--color-border); padding-left: 1rem; margin: 0.5rem 0; color: var(--color-text-tertiary); text-align: left; }
                                                    .markdown-preview a { color: var(--color-accent); text-decoration: underline; }
                                                    .markdown-preview img { max-width: 100%; height: auto; margin: 0.5rem 0; }
                                                    .markdown-preview table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
                                                    .markdown-preview th, .markdown-preview td { border: 1px solid var(--color-border); padding: 0.5rem; text-align: left; color: var(--color-text-secondary); }
                                                    .markdown-preview th { background: var(--color-bg-elevated); font-weight: bold; color: var(--color-text-primary); }
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
                                        <Heading level={4} className="text-sm">
                                            Upload New Images
                                        </Heading>
                                        <label className="cursor-pointer bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-bg-primary)] px-4 py-2 rounded text-sm font-medium transition-opacity">
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
                                    <p className="text-xs text-[var(--color-text-tertiary)]">
                                        Supported formats: JPG, PNG, GIF, WebP, SVG
                                    </p>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map((image) => (
                                        <div key={image.name} className="border border-[var(--color-border)] rounded-lg p-3">
                                            <div className="bg-[var(--color-bg-elevated)] rounded mb-2 overflow-hidden">
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
                                                                handleImageRename(image.name, newImageName);
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
                                                            className="flex-1 text-xs border border-green-500/30 text-green-400 hover:bg-green-500/10 px-2 py-1 rounded transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRenamingImage(null);
                                                                setNewImageName('');
                                                            }}
                                                            className="flex-1 text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-2 py-1 rounded transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-[var(--color-text-tertiary)] truncate mb-2" title={image.name}>
                                                    {image.name}
                                                </p>
                                            )}
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setRenamingImage(image.name);
                                                        // For projects, remove the images/ prefix for editing
                                                        const editName = type === 'project' && image.name.startsWith('images/')
                                                            ? image.name.substring(7)
                                                            : image.name;
                                                        setNewImageName(editName);
                                                    }}
                                                    className="flex-1 text-xs border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 px-2 py-1 rounded transition-colors"
                                                >
                                                    Rename
                                                </button>
                                                <button
                                                    onClick={() => handleImageDelete(image.name)}
                                                    className="flex-1 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>                                {images.length === 0 && (
                                    <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                                        <div className="text-4xl mb-4">🖼️</div>
                                        <p>No images found. Upload some images to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center p-6 border-t border-[var(--color-border)] flex-shrink-0">
                        <div className="text-sm text-[var(--color-text-tertiary)]">
                            {activeTab === 'edit' && selectedFile && (
                                <>
                                    Editing: <span className="font-mono">{selectedFile}</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] rounded transition-colors"
                            >
                                Close
                            </button>
                            {activeTab === 'edit' && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="px-4 py-2 bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-40 text-[var(--color-bg-primary)] rounded font-medium transition-opacity"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

