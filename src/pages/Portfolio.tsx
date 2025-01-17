import { Project } from "../components/Project";
import projects from "../assets/projects";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProjectDetail } from "./ProjectDetail";
import { SEO } from "../components/SEO";

function PortfolioGrid() {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">Portfolio</h1>
            <p className="mb-8">This list is incompete. See my <a href="https://github.com/Googolplexic" target="_blank" rel="noopener noreferrer">GitHub</a> for more projects!</p>  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-8 md:mx-0">
                {projects.map((project, index) => (
                    <Project
                        key={index}
                        {...project}
                    />
                ))}
            </div>
        </div>
    );
}

export function Portfolio() {
    const location = useLocation();
    const projectSlug = location.pathname.split('/portfolio/')[1];
    
    const currentProject = projectSlug ? projects.find(p => p.slug === projectSlug) : null;
    console.log(projectSlug, currentProject);

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
