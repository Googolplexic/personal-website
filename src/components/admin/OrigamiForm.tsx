import { useState } from 'react';
import { apiUrl } from '../../config/api';
import { Heading, Button } from '../ui/base';

interface OrigamiFormData {
    title: string;
    description: string;
    designer: string;
    date: string;
    category: 'my-designs' | 'other-designs';
    slug: string;
}

const initialFormData: OrigamiFormData = {
    title: '',
    description: '',
    designer: '',
    date: '',
    category: 'my-designs',
    slug: '',
};

export function OrigamiForm() {
    const [formData, setFormData] = useState<OrigamiFormData>(initialFormData);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            // Step 1: Create origami metadata (info.md + index.ts) — no images
            const response = await fetch(apiUrl('/create-content'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    type: 'origami',
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    designer: formData.designer,
                    date: formData.date || new Date().toISOString().slice(0, 7),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Failed to create origami' });
                return;
            }

            const result = await response.json();
            const slug = result.slug;

            // Step 2: Upload images one-by-one via /api/upload-image
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const file = Array.from(images)[i];
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });

                    const isPattern = file.name.toLowerCase().includes('pattern');
                    const ext = file.name.split('.').pop();
                    const fileName = isPattern
                        ? `${slug}-pattern.${ext}`
                        : `${String(i + 1).padStart(2, '0')}-${slug}.${ext}`;

                    const imgRes = await fetch(apiUrl('/upload-image'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            type: 'origami',
                            slug,
                            category: formData.category,
                            imageData: base64,
                            fileName,
                        }),
                    });

                    if (!imgRes.ok) {
                        const err = await imgRes.json();
                        console.error(`Failed to upload image ${i + 1}:`, err);
                    }
                }
            }

            setMessage({ type: 'success', text: 'Origami created successfully!' });
            setFormData(initialFormData);
            setImages(null);
            const fileInput = document.getElementById('origami-images') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Failed to create origami' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create origami' });
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get current date in YYYY-MM format
    const getCurrentDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
                        <label htmlFor="origami-title" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="origami-title"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="origami-slug" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Slug * (auto-generated)
                        </label>
                        <input
                            type="text"
                            id="origami-slug"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="origami-category" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Category *
                        </label>
                        <select
                            id="origami-category"
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleInputChange}
                            className="admin-select"
                        >
                            <option value="my-designs">My Designs</option>
                            <option value="other-designs">Other Designs</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="origami-date" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Date (YYYY-MM) *
                        </label>
                        <input
                            type="text"
                            id="origami-date"
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleInputChange}
                            placeholder={getCurrentDate()}
                            className="admin-input"
                        />
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            When you completed/folded this model
                        </p>
                    </div>

                    <div>
                        <label htmlFor="origami-designer" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Designer {formData.category === 'other-designs' && '*'}
                        </label>
                        <input
                            type="text"
                            id="origami-designer"
                            name="designer"
                            required={formData.category === 'other-designs'}
                            value={formData.designer}
                            onChange={handleInputChange}
                            placeholder={formData.category === 'my-designs' ? 'Coleman Lai' : 'Original designer name'}
                            className="admin-input"
                        />
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                    <Heading level={3}>Additional Information</Heading>

                    <div>
                        <label htmlFor="origami-description" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Description
                        </label>
                        <textarea
                            id="origami-description"
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Brief description of the model, folding technique, or story behind it..."
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="origami-images" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Images *
                        </label>
                        <input
                            type="file"
                            id="origami-images"
                            multiple
                            accept="image/*"
                            required
                            onChange={handleImageChange}
                            className="admin-input file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[var(--color-bg-surface)] file:text-[var(--color-text-secondary)] hover:file:text-[var(--color-text-primary)]"
                        />
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            Upload model photos. Name crease pattern files with "pattern" in the filename (e.g., "pattern.jpg")
                        </p>
                    </div>

                    <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-4 rounded-lg">
                        <Heading level={4} className="font-medium text-[var(--color-text-primary)] mb-2">Image Tips</Heading>
                        <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                            <li>• Upload multiple angles of your finished model</li>
                            <li>• Include crease patterns if available (name with "pattern")</li>
                            <li>• Use good lighting for clear photos</li>
                            <li>• Images will be sorted alphabetically by filename</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[var(--color-accent)] text-[var(--color-bg-primary)] rounded-md hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm font-medium tracking-wide"
                >
                    {isSubmitting ? 'Creating...' : 'Add Origami'}
                </Button>
            </div>
        </form>
    );
}
