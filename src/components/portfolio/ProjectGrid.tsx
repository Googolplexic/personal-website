import allProjects from "../../assets/projects";
import { ItemGrid } from "../ui/ItemGrid";

interface ProjectGridProps {
    projectList?: typeof allProjects;
    title?: string;
    className?: string;
    featuredSlugs?: string[];
    hideControls?: boolean;
}

export function ProjectGrid({
    projectList,
    featuredSlugs,
    title,
    className = "",
    hideControls = false
}: ProjectGridProps) {
    const items = projectList || allProjects;

    return (
        <ItemGrid
            items={items}
            title={title}
            className={className}
            featuredSlugs={featuredSlugs}
            hideControls={hideControls}
            itemType="project"
        />
    );
}