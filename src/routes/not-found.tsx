import { NotFound } from '../pages/NotFound';
import { notFoundMeta } from '../utils/seo';

export const meta = notFoundMeta;

export default function NotFoundRoute() {
    return <NotFound />;
}
