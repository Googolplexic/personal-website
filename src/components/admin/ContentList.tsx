import { useState, useEffect } from 'react';
import { EnhancedEditModal } from './EnhancedEditModal';
import { apiUrl } from '../../config/api';
import { Heading, Text, Button } from '../ui/base';

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

export function ContentList() {
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
                        credentials: 'include'
                    }),
                    fetch(apiUrl('/content-list?type=origami'), {
                        credentials: 'include'
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
    }, []);

    const refetchContent = async () => {
        setLoading(true);
        setError(null);

        try {
            const [projectsResponse, origamiResponse] = await Promise.all([
                fetch(apiUrl('/content-list?type=projects'), {
                    credentials: 'include'
                }),
                fetch(apiUrl('/content-list?type=origami'), {
                    credentials: 'include'
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
                <Text className="text-[var(--color-text-tertiary)]">Loading content...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <div className="border border-red-500/20 bg-red-500/10 rounded-md p-4">
                <Text className="text-red-400">{error}</Text>
                <Button
                    onClick={refetchContent}
                    className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                >
                    Try again
                </Button>
            </div>
        );
    }

    if (!content) {
        return (
            <Text className="text-[var(--color-text-tertiary)]">No content found</Text>
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
                    <Heading level={3} className="mb-4">
                        Projects ({content.projects?.length || 0})
                    </Heading>
                    {content.projects && content.projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.projects.map((project) => (
                                <div
                                    key={project.slug}
                                    className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-border-hover)] transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <Heading level={4}>
                                            {String(project.title)}
                                        </Heading>
                                        <span className="text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-1 rounded">
                                            project
                                        </span>
                                    </div>
                                    <Text className="text-sm text-[var(--color-text-tertiary)] mt-1">
                                        /src/assets/projects/{String(project.slug)}/
                                    </Text>
                                    <div className="mt-3 flex space-x-2">
                                        <Button
                                            onClick={() => openEditModal(project.title, project.slug, 'project')}
                                            className="text-xs border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Text className="text-[var(--color-text-tertiary)] text-center py-8">
                            No projects found
                        </Text>
                    )}
                </div>

                {/* My Designs */}
                <div>
                    <Heading level={3} className="mb-4">
                        My Origami Designs ({content.origami?.myDesigns?.length || 0})
                    </Heading>
                    {content.origami?.myDesigns && content.origami.myDesigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.origami.myDesigns.map((design) => (
                                <div
                                    key={design.slug}
                                    className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-border-hover)] transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <Heading level={4}>
                                            {String(design.title)}
                                        </Heading>
                                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">
                                            my design
                                        </span>
                                    </div>
                                    <Text className="text-sm text-[var(--color-text-tertiary)] mt-1">
                                        /src/assets/origami/my-designs/{String(design.slug)}/
                                    </Text>
                                    <div className="mt-3 flex space-x-2">
                                        <Button
                                            onClick={() => openEditModal(String(design.title), String(design.slug), 'origami', 'my-designs')}
                                            className="text-xs border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Text className="text-[var(--color-text-tertiary)] text-center py-8">
                            No designs found
                        </Text>
                    )}
                </div>

                {/* Other Designs */}
                <div>
                    <Heading level={3} className="mb-4">
                        Other Origami Designs ({content.origami?.otherDesigns?.length || 0})
                    </Heading>
                    {content.origami?.otherDesigns && content.origami.otherDesigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.origami.otherDesigns.map((design) => (
                                <div
                                    key={design.slug}
                                    className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-border-hover)] transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <Heading level={4}>
                                            {String(design.title)}
                                        </Heading>
                                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">
                                            other design
                                        </span>
                                    </div>
                                    <Text className="text-sm text-[var(--color-text-tertiary)] mt-1">
                                        /src/assets/origami/other-designs/{String(design.slug)}/
                                    </Text>
                                    <div className="mt-3 flex space-x-2">
                                        <Button
                                            onClick={() => openEditModal(String(design.title), String(design.slug), 'origami', 'other-designs')}
                                            className="text-xs border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 px-2 py-1 rounded transition-colors"
                                        >
                                            Edit Content
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Text className="text-[var(--color-text-tertiary)] text-center py-8">
                            No other designs found
                        </Text>
                    )}
                </div>

                {/* Summary */}
                <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg p-6">
                    <Heading level={3} className="mb-4">
                        Content Summary
                    </Heading>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-[var(--color-accent)]">
                                {content.projects.length}
                            </div>
                            <div className="text-sm text-[var(--color-text-secondary)]">Projects</div>
                        </div>
                        <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-400">
                                {content.origami.myDesigns.length}
                            </div>
                            <div className="text-sm text-[var(--color-text-secondary)]">My Designs</div>
                        </div>
                        <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400">
                                {content.origami.otherDesigns.length}
                            </div>
                            <div className="text-sm text-[var(--color-text-secondary)]">Other Designs</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
