/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints
 * Supports both local development server and Vercel serverless functions
 */

// Check if we should use local server or serverless functions
const isDevelopment = import.meta.env.DEV;
const useLocalServer = import.meta.env.VITE_USE_LOCAL_SERVER === 'true';

// API Base URL logic:
// 1. If VITE_API_URL is set, use it (for custom deployments)
// 2. If in development and USE_LOCAL_SERVER is true, use local server
// 3. Otherwise, use Vercel serverless functions (relative path)
export const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (isDevelopment && useLocalServer ? 'http://localhost:3001' : '');

// Helper function to construct API URLs
export const apiUrl = (endpoint: string) => {
    // For serverless functions, endpoint should start with /api/
    if (!API_BASE_URL && !endpoint.startsWith('/api/')) {
        return `/api/${endpoint.replace(/^\//, '')}`;
    }
    return `${API_BASE_URL}${endpoint}`;
};
