import { ProjectProps } from '../types';
import { useNavigate } from 'react-router-dom';
import { ProjectLinks } from './ProjectLinks';
import { ProjectTechnologies } from './ProjectTechnologies';

export function Project(props: ProjectProps) {
    const navigate = useNavigate();
    const projectSlug = props.slug

    const handleClick = (e: React.MouseEvent) => {
        console.log(e.target);
        if (!(e.target as HTMLElement).closest('a')) {
            navigate(projectSlug);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer border-2 rounded-lg lg:p-12 p-6 mb-4 dark:border-gray-700 border-gray-400 hover:[box-shadow:0_0_15px_2px_rgba(0,0,0,0.2)] dark:hover:[box-shadow:0_0_15px_2px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] h-full flex justify-center flex-col"
        >
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
                {props.startDate === props.endDate ? props.startDate : `${props.startDate} - ${props.endDate || 'Present'}`}
            </p>
            <p className="">{props.summary}</p>
            <ProjectTechnologies technologies={props.technologies} />
            <ProjectLinks project={props} />
        </div>
    );
}