import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('portfolio', 'routes/portfolio.tsx'),
    route('portfolio/:slug', 'routes/project.tsx'),
    route('origami', 'routes/origami.tsx'),
    route('origami/:slug', 'routes/origami-piece.tsx'),
    route('admin', 'routes/admin.tsx'),
    route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
