import { useState, useEffect } from 'react';
import { EnhancedEditModal } from './EnhancedEditModal';
import { apiUrl } from '../../config/api';

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
        return <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Loading content</p>;
    }

    if (error) {
        return (
            <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                <button type="button" className="admin-link mt-4" onClick={refetchContent}>
                    Try again
                </button>
            </div>
        );
    }

    if (!content) {
        return <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No content found</p>;
    }

    const sections: { label: string; items: ContentItem[]; type: 'project' | 'origami'; category?: string }[] = [
        { label: 'Projects', items: content.projects || [], type: 'project' },
        { label: 'My designs', items: content.origami?.myDesigns || [], type: 'origami', category: 'my-designs' },
        { label: 'Other designs', items: content.origami?.otherDesigns || [], type: 'origami', category: 'other-designs' },
    ];

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

            <div className="space-y-10">
                {sections.map((section) => (
                    <section key={section.label}>
                        <p className="gallery-overline mb-2">
                            {section.label} · {section.items.length}
                        </p>
                        {section.items.length > 0 ? (
                            section.items.map((item) => (
                                <button
                                    key={item.slug}
                                    type="button"
                                    className="admin-row"
                                    onClick={() => openEditModal(String(item.title), String(item.slug), section.type, section.category)}
                                >
                                    <span className="truncate">{String(item.title)}</span>
                                    <span className="gallery-overline shrink-0">Edit</span>
                                </button>
                            ))
                        ) : (
                            <p className="text-sm py-4" style={{ color: 'var(--color-text-tertiary)' }}>None yet</p>
                        )}
                    </section>
                ))}
            </div>
        </>
    );
}
