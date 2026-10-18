import { AdminPanel } from '../components/admin';
import { seoMeta } from '../utils/seo';

export const meta = () => seoMeta({
    title: 'Admin | Coleman Lai',
    description: 'Admin area. Not indexed.',
    noindex: true,
});

export default function AdminRoute() {
    return <AdminPanel />;
}
