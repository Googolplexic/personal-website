/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints
 */

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in development and want to use local server
  if (import.meta.env.VITE_USE_LOCAL_SERVER === 'true') {
    return 'http://localhost:3001';
  }
  
  // For production/preview, use the same domain with /api prefix
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  
  // Fallback for SSR or build time
  return import.meta.env.VITE_API_URL || '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to construct API URLs
export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
