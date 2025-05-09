import { useEffect } from 'react';
import useAuth from './useAuth';

/**
 * Custom hook to access the current user's ID
 * This hook handles getting the user ID from either:
 * 1. The useAuth hook (preferred, most current)
 * 2. localStorage (as fallback)
 * 
 * @returns {string|null} The user's ID or null if not authenticated
 */
const useUserId = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Store user ID in localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      localStorage.setItem('userId', user.id);
    }
  }, [user, isAuthenticated]);
  
  /**
   * Get the current user's ID
   * @returns {string|null} User ID or null if not available
   */
  const getUserId = () => {
    // First try to get from auth context (most current)
    if (user?.id) {
      return user.id;
    }
    
    // Fall back to localStorage
    return localStorage.getItem('userId') || null;
  };
  
  return {
    getUserId
  };
};

export default useUserId;
