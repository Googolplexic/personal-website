import projects from "../assets/projects";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProjectDetail } from "./ProjectDetail";
import { SEO } from "../components/layout/SEO";
import { ProjectGrid } from "../components/portfolio/ProjectGrid";

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

    return (
        <>
            <SEO
                title={currentProject
                    ? `${currentProject.title} | Coleman Lai`
                    : "Software Portfolio | Coleman Lai"
                }
                description={currentProject
                    ? (currentProject.description || currentProject.summary)
                    : "Browse my software development projects, including web applications, AI implementations, and technical solutions. SFU Computing Science student portfolio."
                }
                keywords={currentProject?.keywords || [
                    "software portfolio",
                    "full-stack development",
                    "web applications",
                    "React",
                    "TypeScript",
                    "Node.js",
                    "student projects",
                    "SFU"
                ]}
                pathname={currentProject ? `/portfolio/${projectSlug}` : "/portfolio"}
            />
            <Routes>
                <Route index element={<PortfolioGrid />} />
                <Route path=":projectSlug/*" element={<ProjectDetail />} />
            </Routes>
        </>
    );
}
