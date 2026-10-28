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
    images?: string[];
    exhibit?: string; // Wall-label code like "P·07", set by the content loader
    /** Sizes of the item's images that the page shows, keyed by image URL; set by the content loader */
    imageSets?: Record<string, ImageSet>;
}

/** The web copies of one image, from images.server.ts */
export interface ImageSet {
    /** Size of the largest copy */
    width: number;
    height: number;
    /** Copies up to 1280px wide, for page display */
    srcSet: string;
    /** The largest copy, for the lightbox */
    large: string;
    /** A tiny WebP copy as a data URL, shown blurred while the image loads (ImagePlaceholder) */
    placeholder: string;
}

// Project-specific properties
export interface ProjectProps extends BaseItem {
    summary: string;
    description: string; // Markdown-enabled
    technologies: string[];
    githubUrl: string;
    liveUrl?: string;
    type: 'project';
    imagesFull?: string[];
}

// Origami-specific properties
export interface OrigamiProps extends BaseItem {
    description?: string; // Plain text description
    writeup?: string; // Markdown body of info.md, below the frontmatter
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

/** The "Next Exhibit" link at the foot of a detail page. */
export interface NextExhibit {
    slug: string;
    title: string;
    date: string;
    image?: string;
    exhibit: string;
}