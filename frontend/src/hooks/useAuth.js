import { useState, useEffect } from 'react';

/**
 * Custom hook for authentication state and user information
 * @returns {Object} Authentication state and user information
 */
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/api/auth/status', {
          credentials: 'include', // Important for cookies
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Failed to verify authentication status.');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Get user's initials for avatar display
   * @returns {String} User's initials (2 characters)
   */
  const getUserInitials = () => {
    if (!user || !user.username) return 'AS'; // Default to app name initials
    
    const parts = user.username.split(/[ ._-]/); // Split by space, dot, underscore, or dash
    
    if (parts.length >= 2) {
      // If there are multiple parts, take first letter of first two parts
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (user.username.length >= 2) {
      // If username is at least 2 chars, take first two letters
      return user.username.substring(0, 2).toUpperCase();
    } else if (user.username.length === 1) {
      // If username is just 1 char, duplicate it
      return (user.username[0] + user.username[0]).toUpperCase();
    }
    
    return 'AS'; // Fallback
  };

  /**
   * Log out the current user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setIsAuthenticated(false);
      setUser(null);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to log out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    getUserInitials,
    logout
  };
};

export default useAuth;
