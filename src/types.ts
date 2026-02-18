export type ThemeContextType = {
    darkMode: boolean;
    toggleDarkMode: () => void;
};

// Import lazy image types
import type { LazyImageCollection } from './utils/lazyImages';

// Base interface for common properties
export interface BaseItem {
    title: string;
    description?: string; // Markdown-enabled for projects, plain text for origami
    startDate: string;
    endDate?: string;
    slug: string; // Extract folder name as slug
    SEOdescription?: string;  // SEO description
    keywords?: string[];   // SEO keywords as array
    tags?: string[];
    images?: string[] | LazyImageCollection;
}

// Project-specific properties
export interface ProjectProps extends BaseItem {
    summary: string;
    description: string; // Markdown-enabled
    technologies: string[];
    githubUrl: string;
    liveUrl?: string;
    type: 'project';
    images?: string[] | LazyImageCollection;
}

// Origami-specific properties
export interface OrigamiProps extends BaseItem {
    description?: string; // Plain text description
    modelImages: string[];
    modelImagesFull?: string[];
    creasePattern?: string;
    creasePatternFull?: string;
    date: string; // Keep original date field for compatibility
    designer?: string;
    type: 'origami';
    category: 'my-designs' | 'other-designs';
}

// Union type for items that can be either projects or origami
export type ItemProps = ProjectProps | OrigamiProps;