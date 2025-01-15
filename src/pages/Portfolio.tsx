import { Project } from "../components/Project";
import projects from "../assets/projects";
import { Routes, Route } from "react-router-dom";
import { ProjectDetail } from "./ProjectDetail";

function PortfolioGrid() {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">Portfolio</h1>
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
    return (
        <Routes>
            <Route path="/" element={<PortfolioGrid />} />
            <Route path=":projectSlug/*" element={<ProjectDetail />} />
        </Routes>
    );
}
