import { useState, useEffect } from 'react';
import { EnhancedEditModal } from './EnhancedEditModal';
import { apiUrl } from '../../config/api';

interface ContentListProps {
    sessionId: string;
}

interface ContentData {
    projects: string[];
    origami: {
        myDesigns: string[];
        otherDesigns: string[];
    };
}

interface FileViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    path: string;
    type: 'project' | 'origami';
    category?: string;
}

function FileViewModal({ isOpen, onClose, title, path, type, category }: FileViewModalProps) {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchFiles = async () => {
            setLoading(true);
            try {
                // Get session from localStorage (set when logging in)
                const sessionId = localStorage.getItem('adminSessionId');
                const url = type === 'project'
                    ? apiUrl(`/files?path=project/${path}`)
                    : apiUrl(`/files?path=origami/${category}/${path}`);

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                });
                if (response.ok) {
                    const fileList = await response.json();
                    setFiles(fileList);
                }
            } catch (error) {
                console.error('Failed to fetch files:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [isOpen, path, type, category]);

    if (!isOpen) return null;

    const fullPath = type === 'project'
        ? `/src/assets/projects/${path}/`
        : `/src/assets/origami/${category}/${path}/`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Files for {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{fullPath}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Files:</p>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                            {loading ? (
                                <div className="text-gray-600 dark:text-gray-400 font-mono text-sm">Loading files...</div>
                            ) : files.length > 0 ? (
                                <pre className="text-gray-600 dark:text-gray-400 font-mono text-sm whitespace-pre text-left pl-4">
                                    {`📁 ${path}/
${files.map((file, index) => {
                                        const isLast = index === files.length - 1;
                                        const prefix = isLast ? '└── ' : '├── ';
                                        let icon = '📄 ';

                                        if (file.endsWith('/')) {
                                            icon = '📁 ';
                                        } else if (file.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                                            icon = '🖼️ ';
                                        }

                                        return `${prefix}${icon}${file}`;
                                    }).join('\n')}`}
                                </pre>
                            ) : (
                                <div className="text-gray-600 dark:text-gray-400 font-mono text-sm">No files found</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Note:</strong> To edit files, use your code editor and navigate to the path shown above.
                            Changes will be reflected automatically when you save.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ContentList({ sessionId }: ContentListProps) {
    const [content, setContent] = useState<ContentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        path: string;
        type: 'project' | 'origami';
        category?: string;
    }>({
        isOpen: false,
        title: '',
        path: '',
        type: 'project'
    });

    const [editModalState, setEditModalState] = useState<{
        isOpen: boolean;
        title: string;
        path: string;
        type: 'project' | 'origami';
        category?: string;
    }>({
        isOpen: false,
        title: '',
        path: '',
        type: 'project'
    }); useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);

            try {
                const [projectsResponse, origamiResponse] = await Promise.all([
                    fetch(apiUrl('/content-list?type=projects'), {
                        headers: { 'Authorization': `Bearer ${sessionId}` }
                    }),
                    fetch(apiUrl('/content-list?type=origami'), {
                        headers: { 'Authorization': `Bearer ${sessionId}` }
                    })
                ]);

                if (!projectsResponse.ok || !origamiResponse.ok) {
                    throw new Error('Failed to fetch content');
                }

                const projects = await projectsResponse.json();
                const origamiData = await origamiResponse.json();

                // Process origami data to separate by category
                const origami = {
                    myDesigns: origamiData.items?.filter((item: { category?: string }) => item.category === 'my-designs') || [],
                    otherDesigns: origamiData.items?.filter((item: { category?: string }) => item.category === 'other-designs') || []
                };

                setContent({ 
                    projects: projects.items || [], 
                    origami 
                });
            } catch (error) {
                setError('Failed to load content');
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [sessionId]);

    const refetchContent = async () => {
        setLoading(true);
        setError(null);

        try {
            const [projectsResponse, origamiResponse] = await Promise.all([
                fetch(apiUrl('/content-list?type=projects'), {
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                }),
                fetch(apiUrl('/content-list?type=origami'), {
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                })
            ]);

            if (!projectsResponse.ok || !origamiResponse.ok) {
                throw new Error('Failed to fetch content');
            }

            const projects = await projectsResponse.json();
            const origamiData = await origamiResponse.json();

            // Process origami data to separate by category
            const origami = {
                myDesigns: origamiData.items?.filter((item: { category?: string }) => item.category === 'my-designs') || [],
                otherDesigns: origamiData.items?.filter((item: { category?: string }) => item.category === 'other-designs') || []
            };

            setContent({ 
                projects: projects.items || [], 
                origami 
            });
        } catch (error) {
            setError('Failed to load content');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const openFileView = (title: string, path: string, type: 'project' | 'origami', category?: string) => {
        setModalState({
            isOpen: true,
            title,
            path,
            type,
            category
        });
    };

    const closeFileView = () => {
        setModalState({
            isOpen: false,
            title: '',
            path: '',
            type: 'project'
        });
    };

    const openEditModal = (title: string, path: string, type: 'project' | 'origami', category?: string) => {
        setEditModalState({
            isOpen: true,
            title,
            path,
            type,
            category
        });
    };

    const closeEditModal = () => {
        setEditModalState({
            isOpen: false,
            title: '',
            path: '',
            type: 'project'
        });
    }; const openInEditor = (path: string, type: 'project' | 'origami', category?: string) => {
        const fullPath = type === 'project'
            ? `src/assets/projects/${path}/`
            : `src/assets/origami/${category}/${path}/`;

        // For now, show an alert with the path. In a real implementation,
        // you could integrate with VS Code or other editors
        alert(`Open in your code editor:\n${fullPath}\n\nTip: Use Ctrl+Shift+E in VS Code to open the Explorer and navigate to this folder.`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-600 dark:text-gray-400">Loading content...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="text-red-700 dark:text-red-300">{error}</div>
                <button
                    onClick={refetchContent}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="text-gray-600 dark:text-gray-400">No content found</div>
        );
    }

    return (
        <>
            <FileViewModal
                isOpen={modalState.isOpen}
                onClose={closeFileView}
                title={modalState.title}
                path={modalState.path}
                type={modalState.type}
                category={modalState.category}
            />

            <EnhancedEditModal
                isOpen={editModalState.isOpen}
                onClose={closeEditModal}
                title={editModalState.title}
                path={editModalState.path}
                type={editModalState.type}
                category={editModalState.category}
                onSave={() => {
                    // Optionally refresh content list after saving
                    refetchContent();
                }}
            />

            <div className="space-y-8">
                {/* Projects */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Projects ({content.projects.length})
                    </h3>
                    {content.projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.projects.map((project) => (
                                <div
                                    key={project}
                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {project}
                                        </h4>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                            project
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        /src/assets/projects/{project}/
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => openFileView(project, project, 'project')}
                                            className="text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                                        >
                                            View Files
                                        </button>
                                        <button
                                            onClick={() => openEditModal(project, project, 'project')}
                                            className="text-xs bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
                                        </button>
                                        <button
                                            onClick={() => openInEditor(project, 'project')}
                                            className="text-xs bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Open in Editor
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-600 dark:text-gray-400 text-center py-8">
                            No projects found
                        </div>
                    )}
                </div>

                {/* My Designs */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        My Origami Designs ({content.origami.myDesigns.length})
                    </h3>
                    {content.origami.myDesigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.origami.myDesigns.map((design) => (
                                <div
                                    key={design}
                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {design}
                                        </h4>
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                            my design
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        /src/assets/origami/my-designs/{design}/
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => openFileView(design, design, 'origami', 'my-designs')}
                                            className="text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                                        >
                                            View Files
                                        </button>
                                        <button
                                            onClick={() => openEditModal(design, design, 'origami', 'my-designs')}
                                            className="text-xs bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
                                        </button>
                                        <button
                                            onClick={() => openInEditor(design, 'origami', 'my-designs')}
                                            className="text-xs bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Open in Editor
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-600 dark:text-gray-400 text-center py-8">
                            No designs found
                        </div>
                    )}
                </div>

                {/* Other Designs */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Other Origami Designs ({content.origami.otherDesigns.length})
                    </h3>
                    {content.origami.otherDesigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.origami.otherDesigns.map((design) => (
                                <div
                                    key={design}
                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {design}
                                        </h4>
                                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                            other design
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        /src/assets/origami/other-designs/{design}/
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => openFileView(design, design, 'origami', 'other-designs')}
                                            className="text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                                        >
                                            View Files
                                        </button>
                                        <button
                                            onClick={() => openEditModal(design, design, 'origami', 'other-designs')}
                                            className="text-xs bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
                                        </button>
                                        <button
                                            onClick={() => openInEditor(design, 'origami', 'other-designs')}
                                            className="text-xs bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Open in Editor
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-600 dark:text-gray-400 text-center py-8">
                            No other designs found
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Content Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {content.projects.length}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">Projects</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {content.origami.myDesigns.length}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">My Designs</div>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {content.origami.otherDesigns.length}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">Other Designs</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
