import { useState, useEffect } from 'react';
import { apiUrl } from '../../config/api';
import { marked } from 'marked';

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
                const sessionId = localStorage.getItem('adminSessionId');
                const url = type === 'project'
                    ? apiUrl(`/files?path=project/${path}`)
                    : apiUrl(`/files?path=origami/${category}/${path}`);

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                });
                if (response.ok) {
                    const fileData = await response.json();
                    const fileList = fileData.files || [];

                    // Filter markdown files
                    const mdFiles = fileList.filter((file: { name: string; type: string }) => file.name && file.name.endsWith('.md'));
                    setMarkdownFiles(mdFiles);
                    if (mdFiles.length > 0) {
                        setSelectedFile(mdFiles[0].name);
                    }

                    // Filter image files
                    const imageFiles = fileList.filter((file: { name: string; type: string }) =>
                        file.name && file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                    );

                    // Create image objects with URLs
                    const imageObjects = imageFiles.map((file: { name: string; type: string }) => {
                        let url;
                        if (type === 'project') {
                            // For projects, if file already includes "images/" prefix, don't add it again
                            const fileName = file.name.startsWith('images/') ? file.name.substring(7) : file.name;
                            url = apiUrl(`/images?path=project/${path}&file=images/${fileName}`);
                        } else {
                            url = apiUrl(`/images?path=origami/${category}/${path}&file=${file.name}`);
                        }
                        return {
                            name: file.name,
                            url: url
                        };
                    });
                    setImages(imageObjects);
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
                const sessionId = localStorage.getItem('adminSessionId');
                const url = type === 'project'
                    ? apiUrl(`/content?path=project/${path}&file=${selectedFile}`)
                    : apiUrl(`/content?path=origami/${category}/${path}&file=${selectedFile}`);

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                });

                if (response.ok) {
                    const text = await response.text();
                    setContent(text);
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
            const sessionId = localStorage.getItem('adminSessionId');
            const url = type === 'project'
                ? apiUrl(`/content?path=project/${path}&file=${selectedFile}`)
                : apiUrl(`/content?path=origami/${category}/${path}&file=${selectedFile}`);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'text/plain'
                },
                body: content
            });

            if (response.ok) {
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
            const sessionId = localStorage.getItem('adminSessionId');
            const formData = new FormData();

            Array.from(files).forEach(file => {
                formData.append('images', file);
            });

            // Send the correct type for image upload to existing content
            formData.append('type', type); // 'project' or 'origami'
            formData.append('slug', path);
            if (category) {
                formData.append('category', category);
            }

            const endpoint = type === 'project' ? '/create-content' : '/create-content';

            const response = await fetch(apiUrl(endpoint), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionId}`
                },
                body: formData
            });

            if (response.ok) {
                // Refresh the images list instead of full page reload
                const url = type === 'project'
                    ? `http://localhost:3001/api/files/project/${path}`
                    : `http://localhost:3001/api/files/origami/${category}/${path}`;

                const refreshResponse = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                });

                if (refreshResponse.ok) {
                    const fileData = await refreshResponse.json();
                    const fileList = fileData.files || [];
                    const imageFiles = fileList.filter((file: { name: string; type: string }) =>
                        file.name && file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                    );

                    const imageObjects = imageFiles.map((file: { name: string; type: string }) => {
                        let url;
                        if (type === 'project') {
                            // For projects, if file already includes "images/" prefix, don't add it again
                            const fileName = file.name.startsWith('images/') ? file.name.substring(7) : file.name;
                            url = `http://localhost:3001/api/images/project/${path}/images/${fileName}`;
                        } else {
                            url = `http://localhost:3001/api/images/origami/${category}/${path}/${file.name}`;
                        }
                        return { name: file.name, url: url };
                    });
                    setImages(imageObjects);
                }
            } else {
                const errorData = await response.json();
                setError(`Failed to upload images: ${errorData.error || 'Unknown error'}`);
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
            const sessionId = localStorage.getItem('adminSessionId');

            let url;
            if (type === 'project') {
                // For projects, if imageName already includes "images/" prefix, don't add it again
                const fileName = imageName.startsWith('images/') ? imageName.substring(7) : imageName;
                url = `http://localhost:3001/api/images/project/${path}/images/${fileName}`;
            } else {
                url = `http://localhost:3001/api/images/origami/${category}/${path}/${imageName}`;
            }

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionId}`
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
        try {
            const sessionId = localStorage.getItem('adminSessionId');

            let oldUrl;
            if (type === 'project') {
                const oldFileName = oldName.startsWith('images/') ? oldName.substring(7) : oldName;
                oldUrl = `http://localhost:3001/api/images/project/${path}/images/${oldFileName}`;
            } else {
                oldUrl = `http://localhost:3001/api/images/origami/${category}/${path}/${oldName}`;
            }

            const response = await fetch(oldUrl.replace('/api/images/', '/api/rename-image/'), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newName })
            });

            if (response.ok) {
                // Refresh images after rename
                const url = type === 'project'
                    ? `http://localhost:3001/api/files/project/${path}`
                    : `http://localhost:3001/api/files/origami/${category}/${path}`;

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                });

                if (response.ok) {
                    const fileData = await response.json();
                    const fileList = fileData.files || [];
                    const imageFiles = fileList.filter((file: { name: string; type: string }) =>
                        file.name && file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                    );

                    const imageObjects = imageFiles.map((file: { name: string; type: string }) => {
                        let url;
                        if (type === 'project') {
                            const fileName = file.name.startsWith('images/') ? file.name.substring(7) : file.name;
                            url = `http://localhost:3001/api/images/project/${path}/images/${fileName}`;
                        } else {
                            url = `http://localhost:3001/api/images/origami/${category}/${path}/${file.name}`;
                        }
                        return { name: file.name, url: url };
                    });
                    setImages(imageObjects);
                }
            } else {
                console.error('Failed to rename image');
            }
        } catch (error) {
            console.error('Failed to rename image:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Edit {title}
                            </h3>
                            {activeTab === 'edit' && (
                                <div className="flex items-center gap-4 mt-2">
                                    <label className="text-sm text-gray-600 dark:text-gray-400">File:</label>
                                    <select
                                        value={selectedFile}
                                        onChange={(e) => setSelectedFile(e.target.value)}
                                        className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
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
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'edit'
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            📝 Edit Markdown
                        </button>
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'images'
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            🖼️ Manage Images ({images.length})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 m-4">
                                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                            </div>
                        )}                        {activeTab === 'edit' ? (
                            <div className="h-full p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-gray-600 dark:text-gray-400">Loading markdown content...</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-6 h-full">
                                        {/* Editor */}
                                        <div className="flex flex-col h-full">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Markdown Editor
                                            </h4>
                                            <textarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                className="flex-1 p-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter your markdown content here..."
                                            />
                                        </div>

                                        {/* Preview */}
                                        <div className="flex flex-col h-full">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Preview (without frontmatter)
                                            </h4>
                                            <div className="flex-1 p-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 overflow-y-auto">
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
                                                        <p className="text-gray-500 dark:text-gray-400 italic">
                                                            Markdown preview will appear here...
                                                        </p>
                                                    )}
                                                </div>
                                                <style>{`
                                                    .markdown-preview { text-align: left !important; }
                                                    .markdown-preview * { text-align: left !important; }
                                                    .markdown-preview h1 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem 0; text-align: left; }
                                                    .markdown-preview h2 { font-size: 1.25rem; font-weight: bold; margin: 0.75rem 0 0.5rem 0; text-align: left; }
                                                    .markdown-preview h3 { font-size: 1.1rem; font-weight: bold; margin: 0.5rem 0 0.25rem 0; text-align: left; }
                                                    .markdown-preview p { margin: 0.5rem 0; line-height: 1.5; text-align: left; }
                                                    .markdown-preview ul, .markdown-preview ol { margin: 0.5rem 0; padding-left: 1.5rem; text-align: left; }
                                                    .markdown-preview li { margin: 0.25rem 0; text-align: left; }
                                                    .markdown-preview code { 
                                                        background: rgba(156, 163, 175, 0.2); 
                                                        color: #374151; 
                                                        padding: 0.125rem 0.25rem; 
                                                        border-radius: 0.25rem; 
                                                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                                                        font-size: 0.875em;
                                                    }
                                                    .dark .markdown-preview code { 
                                                        background: rgba(75, 85, 99, 0.3); 
                                                        color: #e5e7eb; 
                                                    }
                                                    .markdown-preview pre { 
                                                        background: #f8fafc; 
                                                        border: 1px solid #e2e8f0;
                                                        padding: 0.75rem; 
                                                        border-radius: 0.5rem; 
                                                        overflow-x: auto; 
                                                        margin: 0.5rem 0; 
                                                        text-align: left;
                                                    }
                                                    .dark .markdown-preview pre { 
                                                        background: #1f2937; 
                                                        border: 1px solid #374151;
                                                        color: #e5e7eb;
                                                    }
                                                    .markdown-preview pre code { 
                                                        background: transparent; 
                                                        padding: 0; 
                                                        color: inherit;
                                                    }
                                                    .markdown-preview blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; margin: 0.5rem 0; color: #6b7280; text-align: left; }
                                                    .markdown-preview a { color: #3b82f6; text-decoration: underline; }
                                                    .markdown-preview img { max-width: 100%; height: auto; margin: 0.5rem 0; }
                                                    .markdown-preview table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
                                                    .markdown-preview th, .markdown-preview td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
                                                    .markdown-preview th { background: #f3f4f6; font-weight: bold; }
                                                    .dark .markdown-preview th { background: #374151; }
                                                    .dark .markdown-preview th, .dark .markdown-preview td { border-color: #4b5563; }
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
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Upload New Images
                                        </h4>
                                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Supported formats: JPG, PNG, GIF, WebP, SVG
                                    </p>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map((image) => (
                                        <div key={image.name} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                                            <div className="bg-gray-100 dark:bg-gray-700 rounded mb-2 overflow-hidden">
                                                <img
                                                    src={`${image.url}?auth=${localStorage.getItem('adminSessionId')}`}
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
                                                        className="w-full text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleImageRename(image.name, newImageName);
                                                                setRenamingImage(null);
                                                                setNewImageName('');
                                                            } else if (e.key === 'Escape') {
                                                                setRenamingImage(null);
                                                                setNewImageName('');
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2" title={image.name}>
                                                    {image.name}
                                                </p>
                                            )}
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setRenamingImage(image.name);
                                                        setNewImageName(image.name.startsWith('images/') ? image.name.substring(7) : image.name);
                                                    }}
                                                    className="flex-1 text-xs bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                                                >
                                                    Rename
                                                </button>
                                                <button
                                                    onClick={() => handleImageDelete(image.name)}
                                                    className="flex-1 text-xs bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-2 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>                                {images.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <div className="text-4xl mb-4">🖼️</div>
                                        <p>No images found. Upload some images to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {activeTab === 'edit' && selectedFile && (
                                <>
                                    Editing: <span className="font-mono">{selectedFile}</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded"
                            >
                                Close
                            </button>
                            {activeTab === 'edit' && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded"
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
