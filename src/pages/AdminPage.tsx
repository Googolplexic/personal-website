import { AdminPanel } from '../components/admin';
import { SEO } from '../components/layout/SEO';

export function AdminPage() {
    return (
        <>
            <SEO
                title="Admin | Coleman Lai"
                description="Admin area. Not indexed."
                noindex
            />
            <AdminPanel />
        </>
    );
}