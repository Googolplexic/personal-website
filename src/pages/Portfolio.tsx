import projects from "../assets/projects";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProjectDetail } from "./ProjectDetail";
import { SEO } from "../components/layout/SEO";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

const ProjectGrid = lazy(() =>
    import("../components/portfolio/ProjectGrid").then((m) => ({ default: m.ProjectGrid }))
);

function PortfolioGrid() {
    const galleryRef = useRef<HTMLDivElement>(null);
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isDesktop) {
            setShowGallery(true);
            return;
        }
        let timer: number | null = null;
        let idleId: number | null = null;
        const enable = () => setShowGallery(true);
        const ric = (window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        }).requestIdleCallback;

        if (ric) {
            idleId = ric(enable, { timeout: 1400 });
        } else {
            timer = window.setTimeout(enable, 1300);
        }

        return () => {
            if (timer !== null) window.clearTimeout(timer);
            if (idleId !== null) {
                const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
                if (cic) cic(idleId);
            }
        };
    }, []);

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
            <div ref={galleryRef}>
                {showGallery ? (
                    <Suspense fallback={<div style={{ minHeight: '34rem' }} />}>
                        <ProjectGrid />
                    </Suspense>
                ) : (
                    <div style={{ minHeight: '34rem' }} />
                )}
            </div>
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
