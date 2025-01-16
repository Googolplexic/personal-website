import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function NotFound() {
    return (
        <>
            <SEO 
                title="Page Not Found | 404 Error | Coleman Lai"
                description="Sorry, the page you're looking for doesn't exist. Return to Coleman Lai's homepage to explore software projects and origami creations."
                type="website"
                // Adding noindex to prevent search engines from indexing the 404 page
                children={
                    <meta name="robots" content="noindex, follow" />
                }
            />
            
            <div className="text-center">
                <h1>404 - Page Not Found</h1>
                <p className="mb-8">The page you're looking for doesn't exist.</p>
                <Link 
                    to="/" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Return to Home
                </Link>
            </div>
        </>
    );
}
