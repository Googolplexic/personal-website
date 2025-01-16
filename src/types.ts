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
    SEOdescription?: string;  // SEO description
    keywords?: string[];   // SEO keywords as array
}