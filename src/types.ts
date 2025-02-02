export type ThemeContextType = {
    darkMode: boolean;
    toggleDarkMode: () => void;
};
export type ProjectProps = {
    title: string;
    summary: string;
    description: string; // Markdown-enabled
    technologies: string[];
    githubUrl: string;
    liveUrl?: string;
    images?: string[];
    startDate: string;
    endDate?: string;
    slug: string; // Extract folder name as slug
    SEOdescription?: string;  // SEO description
    keywords?: string[];   // SEO keywords as array
    tags?: string[];  // Add this new field
}