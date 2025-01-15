import { ProjectProps } from '../types';
import { Link } from 'react-router-dom';

export function Project(props: ProjectProps) {
    const projectSlug = props.title.toLowerCase().replace(/\s+/g, '-');
    
    return (
        <Link to={projectSlug} className="block">
            <div className="border-2 rounded-lg p-4 mb-4 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-500 hover:shadow-gray-400 transition-shadow">
                {props.images && props.images.length > 0 && (
                    <div className="flex gap-2 mb-4 mx-auto justify-center">
                        <img
                            src={props.images[0]}
                            alt={`${props.title}`}
                            className="max-h-[12rem] w-auto h-auto object-contain rounded-lg"
                        />
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-2">{props.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {props.startDate} - {props.endDate || 'Present'}
                </p>
                <p className="mb-4">{props.summary}</p>
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {props.technologies.map((tech, index) => (
                        <span key={index} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {tech}
                        </span>
                    ))}
                </div>
                <div className="flex gap-4 justify-center">
                    <a
                        href={props.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        GitHub
                    </a>
                    {props.liveUrl && (
                        <a
                            href={props.liveUrl}
                            target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                        >
                            View Site
                        </a>
                    )}
                </div>
            </div>
        </Link>
    );
}