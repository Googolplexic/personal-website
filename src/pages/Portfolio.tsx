import { ItemGrid } from "../components/ui/ItemGrid";
import { ProjectProps } from "../types";

export function Portfolio({ projects }: { projects: ProjectProps[] }) {
    return (
        <div className="max-w-6xl mx-auto px-6 pb-20 pt-32">
            <div className="text-center mb-14">
                <p className="gallery-overline mb-4">The Gallery</p>
                <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-ink">
                    Portfolio
                </h1>
                <p className="text-base font-heading italic max-w-lg mx-auto text-ink-muted">
                    Software crafted with care.
                </p>
            </div>
            <ItemGrid items={projects} itemType="project" />
        </div>
    );
}
