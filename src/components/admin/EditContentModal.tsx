import { useState, useEffect } from 'react';

interface EditContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    path: string;
    type: 'project' | 'origami';
    category?: string;
    onSave?: () => void;
}

export function EditContentModal({ isOpen, onClose, title, path, type, category, onSave }: EditContentModalProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    const [files, setFiles] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchFiles = async () => {
            try {
                const sessionId = localStorage.getItem('adminSessionId');
                const url = type === 'project'
                    ? `http://localhost:3001/api/files/project/${path}`
                    : `http://localhost:3001/api/files/origami/${category}/${path}`;

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                });
                if (response.ok) {
                    const fileList = await response.json();
                    // Filter to only markdown files that can be edited
                    const editableFiles = fileList.filter((file: string) =>
                        file.endsWith('.md')
                    );
                    setFiles(editableFiles);
                    if (editableFiles.length > 0) {
                        setSelectedFile(editableFiles[0]);
                    }
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
                    ? `http://localhost:3001/api/content/project/${path}/${selectedFile}`
                    : `http://localhost:3001/api/content/origami/${category}/${path}/${selectedFile}`;

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
                ? `http://localhost:3001/api/content/project/${path}/${selectedFile}`
                : `http://localhost:3001/api/content/origami/${category}/${path}/${selectedFile}`;

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
                onClose();
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Edit {title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">File:</label>
                            <select
                                value={selectedFile}
                                onChange={(e) => setSelectedFile(e.target.value)}
                                className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                                title="Select file to edit"
                            >
                                {files.map(file => (
                                    <option key={file} value={file}>{file}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-hidden">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
                            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-600 dark:text-gray-400">Loading file content...</div>
                        </div>
                    ) : (
                        <div className="h-full">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="File content will appear here..."
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFile && (
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
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
