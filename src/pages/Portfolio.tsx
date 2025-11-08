import projects from "../assets/projects";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProjectDetail } from "./ProjectDetail";
import { SEO } from "../components/layout/SEO";
import { ProjectGrid } from "../components/portfolio/ProjectGrid";
import { Heading, Text, Link } from "../components/ui/base";

function PortfolioGrid() {
    return (
        <div className="text-center">
            <Heading level={1}>Portfolio</Heading>
            <Text className="mb-8">
                These project pages are all dynamically generated! See my{' '}
                <Link href="https://www.colemanlai.com/portfolio/personal-website" target="_blank" rel="noopener">
                    personal website
                </Link>
                {' '}page for more detail.
            </Text>
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
