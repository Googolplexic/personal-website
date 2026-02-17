import { useState, useEffect } from 'react';
import { apiUrl } from '../../config/api';
import { Heading } from '../ui/base/Heading';

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
                const url = type === 'project'
                    ? apiUrl(`/files?path=project/${path}`)
                    : apiUrl(`/files?path=origami/${category}/${path}`);

                const response = await fetch(url, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const fileData = await response.json();
                    const fileList = fileData.files || [];
                    // Filter to only markdown files that can be edited
                    const editableFiles = fileList.filter((file: { name: string; type: string }) =>
                        file.name && file.name.endsWith('.md')
                    );
                    setFiles(editableFiles.map((f: { name: string; type: string }) => f.name));
                    if (editableFiles.length > 0) {
                        setSelectedFile(editableFiles[0].name);
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
                const url = type === 'project'
                    ? apiUrl(`/content?path=project/${path}&file=${selectedFile}`)
                    : apiUrl(`/content?path=origami/${category}/${path}&file=${selectedFile}`);

                const response = await fetch(url, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setContent(data.content);
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
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: content,
                    sha: null // For now, since we don't track SHA in this component
                })
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
                    <div>
                        <Heading level={3}>
                            Edit {title}
                        </Heading>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="text-sm text-[var(--color-text-tertiary)]">File:</label>
                            <select
                                value={selectedFile}
                                onChange={(e) => setSelectedFile(e.target.value)}
                                className="admin-select w-auto text-sm px-2 py-1"
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
                        className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-hidden">
                    {error && (
                        <div className="border border-red-500/20 bg-red-500/10 rounded p-3 mb-4">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-[var(--color-text-tertiary)]">Loading file content...</div>
                        </div>
                    ) : (
                        <div className="h-full">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-full p-4 border border-[var(--color-border)] rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-mono text-sm resize-none focus:border-[var(--color-accent)] focus:outline-none"
                                placeholder="File content will appear here..."
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center p-6 border-t border-[var(--color-border)]">
                    <div className="text-sm text-[var(--color-text-tertiary)]">
                        {selectedFile && (
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
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="px-4 py-2 bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-40 text-[var(--color-bg-primary)] rounded font-medium transition-opacity"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
