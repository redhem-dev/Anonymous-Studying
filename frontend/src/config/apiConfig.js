/**
 * API Configuration
 * 
 * This module provides the appropriate API base URL based on the environment.
 * It helps manage the transition between local development and production deployment.
 */

// API Base URL determination based on environment
const getApiBaseURL = () => {
  // For local development
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  
  // For production, check if environment variables are provided
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default production URL if no environment variables are set
  return 'https://api.anonymous-studying.com';
};

// Pre-computed API base URL for convenience
const API_BASE_URL = getApiBaseURL();

export { API_BASE_URL, getApiBaseURL };

// Export a helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  // Ensure endpoint starts with / if not already
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

export default API_BASE_URL;
