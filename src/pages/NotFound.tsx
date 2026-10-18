import { FrameButton } from '../components/ui/FrameButton';

interface NotFoundProps {
    overline?: string;
    title?: string;
    message?: string;
}

export function NotFound({
    overline = 'Error 404',
    title = 'Page Not Found',
    message = "The page you're looking for doesn't exist.",
}: NotFoundProps) {
    return (
        <div className="min-h-svh flex items-center pt-28 pb-20">
            <div className="page-grid">
                <div className="col-span-full lg:col-span-8 border-l border-solid border-line-strong pl-5 md:pl-8">
                    <p className="gallery-overline mt-0 mb-4">{overline}</p>
                    <h1 className="gallery-heading text-title m-0 text-ink">
                        {title}
                    </h1>
                    <p className="font-body text-lg mt-4 mb-10 text-ink-muted">
                        {message}
                    </p>
                    <FrameButton to="/">Return to Gallery</FrameButton>
                </div>
            </div>
        </div>
    );
}
