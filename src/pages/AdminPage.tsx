import { AdminPanel } from '../components/admin';
import { SEO } from '../components/layout/SEO';

export function AdminPage() {
    return (
        <>
            <SEO
                title="Admin | Coleman Lai"
                description="Admin area. Not indexed. Site owner: Coleman Lai, currently a Gen AI Software Developer (Co-op) at IFS Copperleaf (Sept 2025-Apr 2026)."
                noindex
            />
            <AdminPanel />
        </>
    );
}