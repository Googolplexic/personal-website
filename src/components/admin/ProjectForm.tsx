import { useState } from 'react';
import { apiUrl } from '../../config/api';
import { Heading, Button } from '../ui/base';

interface ProjectFormData {
    title: string;
    summary: string;
    description: string;
    technologies: string[];
    githubUrl: string;
    liveUrl: string;
    startDate: string;
    endDate: string;
    tags: string[];
    keywords: string[];
    SEOdescription: string;
    slug: string;
}

const initialFormData: ProjectFormData = {
    title: '',
    summary: '',
    description: '',
    technologies: [],
    githubUrl: '',
    liveUrl: '',
    startDate: '',
    endDate: '',
    tags: [],
    keywords: [],
    SEOdescription: '',
    slug: '',
};

export function ProjectForm() {
    const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
    const [images, setImages] = useState<FileList | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-generate slug when title changes
            if (name === 'title') {
                updated.slug = generateSlug(value);
            }

            return updated;
        });
    };

    const handleArrayInputChange = (name: keyof ProjectFormData, value: string) => {
        const items = value.split(',').map(item => item.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, [name]: items }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        // Validate required fields
        if (!formData.title.trim()) {
            setMessage({ type: 'error', text: 'Title is required' });
            setIsSubmitting(false);
            return;
        }

        if (!formData.slug.trim()) {
            setMessage({ type: 'error', text: 'Slug is required (auto-generated from title)' });
            setIsSubmitting(false);
            return;
        }

        try {
            // Convert images to base64 if present
            const imageData = [];
            if (images) {
                for (const file of Array.from(images)) {
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });

                    imageData.push({
                        data: base64,
                        ext: file.name.split('.').pop()
                    });
                }
            }

            const response = await fetch(apiUrl('/create-content'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Use cookies instead of Authorization header
                body: JSON.stringify({
                    type: 'project',
                    title: formData.title,
                    description: formData.description,
                    summary: formData.summary,
                    technologies: formData.technologies,
                    githubUrl: formData.githubUrl,
                    liveUrl: formData.liveUrl,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    tags: formData.tags,
                    keywords: formData.keywords,
                    SEOdescription: formData.SEOdescription,
                    images: imageData,
                }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Project created successfully!' });
                setFormData(initialFormData);
                setImages(null);
                // Reset file input
                const fileInput = document.getElementById('images') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Failed to create project' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create project' });
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-md border ${message.type === 'success'
                    ? 'border-green-500/20 bg-green-500/10 text-green-400'
                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <Heading level={3}>Basic Information</Heading>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Slug * (auto-generated)
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Summary *
                        </label>
                        <textarea
                            id="summary"
                            name="summary"
                            required
                            rows={3}
                            value={formData.summary}
                            onChange={handleInputChange}
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="technologies" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Technologies (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="technologies"
                            value={formData.technologies.join(', ')}
                            onChange={(e) => handleArrayInputChange('technologies', e.target.value)}
                            placeholder="React, TypeScript, Node.js"
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="githubUrl" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            GitHub URL *
                        </label>
                        <input
                            type="url"
                            id="githubUrl"
                            name="githubUrl"
                            required
                            value={formData.githubUrl}
                            onChange={handleInputChange}
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="liveUrl" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Live URL (optional)
                        </label>
                        <input
                            type="url"
                            id="liveUrl"
                            name="liveUrl"
                            value={formData.liveUrl}
                            onChange={handleInputChange}
                            className="admin-input"
                        />
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                    <Heading level={3}>Additional Information</Heading>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Start Date (YYYY-MM)
                            </label>
                            <input
                                type="text"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                placeholder="2024-01"
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                End Date (YYYY-MM)
                            </label>
                            <input
                                type="text"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                placeholder="2024-03"
                                className="admin-input"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            value={formData.tags.join(', ')}
                            onChange={(e) => handleArrayInputChange('tags', e.target.value)}
                            placeholder="web-app, full-stack, school-project"
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="keywords" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            SEO Keywords (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="keywords"
                            value={formData.keywords.join(', ')}
                            onChange={(e) => handleArrayInputChange('keywords', e.target.value)}
                            placeholder="web development, react app, student project"
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="SEOdescription" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            SEO Description
                        </label>
                        <textarea
                            id="SEOdescription"
                            name="SEOdescription"
                            rows={3}
                            value={formData.SEOdescription}
                            onChange={handleInputChange}
                            placeholder="A detailed description for search engines and social sharing..."
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="images" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Images
                        </label>
                        <input
                            type="file"
                            id="images"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="admin-input file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[var(--color-bg-surface)] file:text-[var(--color-text-secondary)] hover:file:text-[var(--color-text-primary)]"
                        />
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            Select multiple images for the project gallery
                        </p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Description (Markdown) *
                </label>
                <textarea
                    id="description"
                    name="description"
                    required
                    rows={8}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="## Project Overview&#10;&#10;A detailed description of your project...&#10;&#10;### Features&#10;&#10;- Feature 1&#10;- Feature 2"
                    className="admin-input font-mono text-sm"
                />
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[var(--color-accent)] text-[var(--color-bg-primary)] rounded-md hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm font-medium tracking-wide"
                >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
}
