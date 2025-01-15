import { useParams } from 'react-router-dom';
import projects from '../assets/projects';
import Markdown from 'react-markdown';
import { useState } from 'react';

export function ProjectDetail() {
    const { projectSlug } = useParams();
    const project = projects.find(p =>
        p.title.toLowerCase().replace(/\s+/g, '-') === projectSlug
    );
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!project) {
        return <div>Project not found</div>;
    }

    const nextImage = () => {
        if (!project.images) return;
        setCurrentImageIndex((prev) =>
            prev === project.images!.length - 1 ? 0 : prev + 1
        );
    };
    const prevImage = () => {
        if (!project.images) return;
        setCurrentImageIndex((prev) =>
            prev === 0 ? project.images!.length - 1 : prev - 1
        );
    };
    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                {project.startDate} - {project.endDate || 'Present'}
            </p>
            {project.images && project.images.length > 0 && (
                <div className="relative mb-8 group">
                    <div className="max-w-[80%] h-72 mx-auto mb-4 rounded-lg flex align-middle">
                        <img
                            src={project.images[currentImageIndex]}
                            alt={`${project.title} - Image ${currentImageIndex + 1}`}
                            className="mx-auto max-h-72 object-contain rounded-lg my-auto cursor-pointer"
                            onClick={() => {
                                if (project.images) {
                                    window.open(project.images[currentImageIndex], '_blank');
                                }
                            }}
                        />
                    </div>
                    {project.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ←
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-l opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                →
                            </button>
                            <div>
                                {project.images.map((_, index) => (
                                    <button
                                        key={index}
                                        title={`View image ${index + 1}`}
                                        aria-label={`View image ${index + 1}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-12 h-1 p-2 mx-1 rounded-full ${index === currentImageIndex
                                            ? 'bg-gray-600 dark:bg-gray-300'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
            <div className="flex gap-4 justify-center">
                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    GitHub
                </a>
                {project.liveUrl && (
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        View Site
                    </a>
                )}
            </div>
            <div className="my-8">
                <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
                <div className="flex flex-wrap gap-2 justify-center">
                    {project.technologies.map((tech, index) => (
                        <span key={index} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
            <div className="prose dark:prose-invert max-w-none text-left">
                <Markdown>{project.description}</Markdown>
            </div>

        </div>
    );
}
