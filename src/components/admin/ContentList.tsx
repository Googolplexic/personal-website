import { useState, useEffect } from 'react';
import { EnhancedEditModal } from './EnhancedEditModal';
import { apiUrl } from '../../config/api';

interface ContentListProps {
    sessionId: string;
}

interface ContentItem {
    slug: string;
    title: string;
    path: string;
    category?: string;
}

interface ContentData {
    projects: ContentItem[];
    origami: {
        myDesigns: ContentItem[];
        otherDesigns: ContentItem[];
    };
}

export function ContentList({ sessionId }: ContentListProps) {
    const [content, setContent] = useState<ContentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                        Projects ({content.projects?.length || 0})
                    </h3>
                    {content.projects && content.projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.projects.map((project) => (
                                <div
                                    key={project.slug}
                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {String(project.title)}
                                        </h4>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                            project
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        /src/assets/projects/{String(project.slug)}/
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => openEditModal(project.title, project.slug, 'project')}
                                            className="text-xs bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
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
                        My Origami Designs ({content.origami?.myDesigns?.length || 0})
                    </h3>
                    {content.origami?.myDesigns && content.origami.myDesigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.origami.myDesigns.map((design) => (
                                <div
                                    key={design.slug}
                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {String(design.title)}
                                        </h4>
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                            my design
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        /src/assets/origami/my-designs/{String(design.slug)}/
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => openEditModal(String(design.title), String(design.slug), 'origami', 'my-designs')}
                                            className="text-xs bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
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
                        Other Origami Designs ({content.origami?.otherDesigns?.length || 0})
                    </h3>
                    {content.origami?.otherDesigns && content.origami.otherDesigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.origami.otherDesigns.map((design) => (
                                <div
                                    key={design.slug}
                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {String(design.title)}
                                        </h4>
                                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                            other design
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        /src/assets/origami/other-designs/{String(design.slug)}/
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => openEditModal(String(design.title), String(design.slug), 'origami', 'other-designs')}
                                            className="text-xs bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
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
