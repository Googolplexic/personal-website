import allProjects from "../assets/projects";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProjectDetail } from "./ProjectDetail";
import { SEO } from "../components/layout/SEO";
import { ProjectGrid } from "../components/portfolio/ProjectGrid";
import { usePortfolioLeadActive } from "../utils/portfolioBootLead";

const BASE_URL = "https://www.colemanlai.com";

function absoluteImage(src: string | undefined): string | undefined {
    if (!src) return undefined;
    return src.startsWith('http') ? src : `${BASE_URL}${src}`;
}

function getProjectImage(project: typeof allProjects[number]): string | undefined {
    const imgs = project.images;
    if (!imgs) return undefined;
    if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
    return undefined;
}

function PortfolioGrid() {
    const staticTitle = typeof document !== 'undefined' && document.getElementById('boot-portfolio');
    const leadActive = usePortfolioLeadActive();
    return (
        <div className={`max-w-6xl mx-auto px-6 pb-20 ${leadActive ? 'pt-0' : staticTitle ? 'pt-10' : 'pt-32'}`}>
            {!staticTitle && (
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
            )}
            <ProjectGrid />
        </div>
    );
}

export function Portfolio() {
    const location = useLocation();
    const projectSlug = location.pathname.split('/portfolio/')[1];
    const currentProject = projectSlug ? allProjects.find(p => p.slug === projectSlug) : null;

    const projectImage = currentProject ? getProjectImage(currentProject) : undefined;
    const projectOgImage = absoluteImage(projectImage);
    const portfolioLead = !currentProject
        ? [...allProjects]
            .filter(project => getProjectImage(project))
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
        : undefined;
    const portfolioOgImage = absoluteImage(portfolioLead ? getProjectImage(portfolioLead) : undefined);

    const portfolioListingSchema = !currentProject ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Software Portfolio | Coleman Lai",
        "description": "Browse software development projects by Coleman Lai, including web applications, AI implementations, and technical solutions.",
        "url": `${BASE_URL}/portfolio`,
        "isPartOf": { "@type": "WebSite", "name": "Coleman Lai", "url": BASE_URL },
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": allProjects.length,
            "itemListElement": allProjects.map((p, i) => ({
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
                    ? (currentProject.SEOdescription || currentProject.summary)
                    : "Browse my software development projects, including web applications, AI implementations, and technical solutions."
                }
                keywords={currentProject
                    ? (currentProject.keywords || [])
                    : [
                        "software portfolio",
                        "full-stack development",
                        "web applications",
                        "React",
                        "TypeScript",
                        "Node.js"
                    ]
                }
                pathname={currentProject ? `/portfolio/${projectSlug}` : "/portfolio"}
                type={currentProject ? "article" : "website"}
                image={currentProject ? projectOgImage : portfolioOgImage}
                imageAlt={currentProject ? `Screenshot of ${currentProject.title}` : "Screenshot from the newest portfolio project"}
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
