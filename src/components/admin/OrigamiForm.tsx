import { useState } from 'react';
import { apiUrl } from '../../config/api';

interface OrigamiFormProps {
    sessionId: string;
}

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

export function OrigamiForm({ sessionId }: OrigamiFormProps) {
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
                        ext: file.name.split('.').pop(),
                        isPattern: file.name.toLowerCase().includes('pattern')
                    });
                }
            }

            const response = await fetch(apiUrl('/create-content'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}`,
                },
                body: JSON.stringify({
                    type: 'origami',
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    designer: formData.designer,
                    date: formData.date || new Date().toISOString().slice(0, 7),
                    images: imageData,
                }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Origami created successfully!' });
                setFormData(initialFormData);
                setImages(null);
                // Reset file input
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
                <div className={`p-4 rounded-md ${message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>

                    <div>
                        <label htmlFor="origami-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="origami-title"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="origami-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Slug * (auto-generated)
                        </label>
                        <input
                            type="text"
                            id="origami-slug"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="origami-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category *
                        </label>
                        <select
                            id="origami-category"
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="my-designs">My Designs</option>
                            <option value="other-designs">Other Designs</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="origami-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            When you completed/folded this model
                        </p>
                    </div>

                    <div>
                        <label htmlFor="origami-designer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>

                    <div>
                        <label htmlFor="origami-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="origami-description"
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Brief description of the model, folding technique, or story behind it..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="origami-images" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Images *
                        </label>
                        <input
                            type="file"
                            id="origami-images"
                            multiple
                            accept="image/*"
                            required
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Upload model photos. Name crease pattern files with "pattern" in the filename (e.g., "pattern.jpg")
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Image Tips</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Upload multiple angles of your finished model</li>
                            <li>• Include crease patterns if available (name with "pattern")</li>
                            <li>• Use good lighting for clear photos</li>
                            <li>• Images will be sorted alphabetically by filename</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Creating...' : 'Add Origami'}
                </button>
            </div>
        </form>
    );
}
