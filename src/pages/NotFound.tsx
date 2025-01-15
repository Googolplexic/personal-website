import { Link } from 'react-router-dom';

export function NotFound() {
    return (
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
    );
}
