/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints
 */

// Simple configuration - use local server for admin functionality
// This ensures the main website works without any API dependencies
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to construct API URLs
export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
