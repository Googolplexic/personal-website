import projects from "../assets/projects";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProjectDetail } from "./ProjectDetail";
import { SEO } from "../components/layout/SEO";
import { ProjectGrid } from "../components/portfolio/ProjectGrid";

const BASE_URL = "https://www.colemanlai.com";
const ROLE_SEO_SENTENCE = "Currently a Gen AI Software Developer (Co-op) at IFS Copperleaf (Sept 2025-Apr 2026).";

function withCurrentRoleSeo(description: string): string {
    const trimmed = description.trim();
    if (!trimmed) return ROLE_SEO_SENTENCE;
    const needsTerminalPunctuation = !/[.!?]$/.test(trimmed);
    return `${trimmed}${needsTerminalPunctuation ? '.' : ''} ${ROLE_SEO_SENTENCE}`;
}

function getProjectImage(project: typeof projects[number]): string | undefined {
    const imgs = project.images;
    if (!imgs) return undefined;
    if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
    return undefined;
}

function PortfolioGrid() {
    return (
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
            <div className="text-center mb-14">
                <p className="gallery-overline mb-4">The Gallery</p>
                <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4"
                    style={{ color: 'var(--color-text-primary)' }}>
                    Portfolio
                </h1>
                <p className="text-base font-heading italic max-w-lg mx-auto"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    Software crafted with care.
                </p>
            </div>
            <ProjectGrid />
        </div>
    );
}

export function Portfolio() {
    const location = useLocation();
    const projectSlug = location.pathname.split('/portfolio/')[1];
    const currentProject = projectSlug ? projects.find(p => p.slug === projectSlug) : null;

    const projectImage = currentProject ? getProjectImage(currentProject) : undefined;
    const projectOgImage = projectImage
        ? (projectImage.startsWith('http') ? projectImage : `${BASE_URL}${projectImage}`)
        : undefined;

    const portfolioListingSchema = !currentProject ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Software Portfolio | Coleman Lai",
        "description": "Browse software development projects by Coleman Lai, including web applications, AI implementations, and technical solutions.",
        "url": `${BASE_URL}/portfolio`,
        "isPartOf": { "@type": "WebSite", "name": "Coleman Lai", "url": BASE_URL },
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": projects.length,
            "itemListElement": projects.map((p, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": p.title,
                "url": `${BASE_URL}/portfolio/${p.slug}`
            }))
        }
    } : undefined;

    const projectSchema = currentProject ? [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            "name": currentProject.title,
            "description": currentProject.SEOdescription || currentProject.summary,
            "url": `${BASE_URL}/portfolio/${projectSlug}`,
            "author": { "@type": "Person", "name": "Coleman Lai", "url": BASE_URL },
            "dateCreated": currentProject.startDate,
            ...(currentProject.endDate && { "dateModified": currentProject.endDate }),
            "programmingLanguage": currentProject.technologies,
            ...(currentProject.githubUrl && { "codeRepository": currentProject.githubUrl }),
            ...(projectImage && { "image": projectOgImage }),
            "keywords": currentProject.keywords?.join(', ') || currentProject.technologies.join(', ')
        }
    ] : undefined;

    return (
        <>
            <SEO
                title={currentProject
                    ? `${currentProject.title} | Coleman Lai`
                    : "Software Portfolio | Coleman Lai"
                }
                description={currentProject
                    ? withCurrentRoleSeo(currentProject.SEOdescription || currentProject.summary)
                    : withCurrentRoleSeo("Browse my software development projects, including web applications, AI implementations, and technical solutions.")
                }
                keywords={currentProject
                    ? [...(currentProject.keywords || []), "IFS Copperleaf", "Gen AI software developer", "co-op"]
                    : [
                        "software portfolio",
                        "full-stack development",
                        "web applications",
                        "React",
                        "TypeScript",
                        "Node.js",
                        "IFS Copperleaf",
                        "Gen AI software developer",
                        "co-op"
                    ]
                }
                pathname={currentProject ? `/portfolio/${projectSlug}` : "/portfolio"}
                type={currentProject ? "article" : "website"}
                image={projectOgImage}
                imageAlt={currentProject ? `Screenshot of ${currentProject.title}` : undefined}
                article={currentProject ? {
                    publishedTime: currentProject.startDate,
                    modifiedTime: currentProject.endDate,
                    section: "Software Development",
                    tags: currentProject.technologies
                } : undefined}
                breadcrumbs={currentProject ? [
                    { name: "Home", url: BASE_URL },
                    { name: "Portfolio", url: `${BASE_URL}/portfolio` },
                    { name: currentProject.title, url: `${BASE_URL}/portfolio/${projectSlug}` }
                ] : [
                    { name: "Home", url: BASE_URL },
                    { name: "Portfolio", url: `${BASE_URL}/portfolio` }
                ]}
                structuredData={currentProject ? projectSchema : portfolioListingSchema ? [portfolioListingSchema] : undefined}
            />
            <Routes>
                <Route index element={<PortfolioGrid />} />
                <Route path=":projectSlug/*" element={<ProjectDetail />} />
            </Routes>
        </>
    );
}
