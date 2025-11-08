import { SEO } from '../components/layout/SEO';
import { Heading, Text, Link } from '../components/ui/base';
import { spacing, themeClasses } from '../utils/styles';

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
                <Heading level={1}>404 - Page Not Found</Heading>
                <Text className={spacing({ mb: '8' })}>The page you're looking for doesn't exist.</Text>
                <Link
                    to="/"
                    className={themeClasses('text-blue-600', 'text-blue-400')}
                >
                    Return to Home
                </Link>
            </div>
        </>
    );
}
