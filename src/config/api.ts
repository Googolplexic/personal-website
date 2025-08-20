/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints
 */

// Get the API base URL from environment variable or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to construct API URLs
export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
