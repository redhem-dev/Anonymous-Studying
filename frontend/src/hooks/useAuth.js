import { useState, useEffect, useCallback, useRef } from 'react';
import { buildApiUrl } from '../config/apiConfig';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  
  // Use a ref to track if a refresh is in progress to prevent duplicate calls
  const refreshInProgress = useRef(false);

  // Centralized function to update auth state based on API response
  const updateAuthState = useCallback((data) => {
    // Handle fully authenticated users
    if (data.isAuthenticated && data.user) {
      setIsAuthenticated(true);
      setUser(data.user);
      setTempUser(null);
      localStorage.removeItem('pendingEmail'); // Always clean up on successful auth
    }
    // Handle temporary users (Google auth completed but username not set)
    else if (data.tempUser && data.email) {
      setIsAuthenticated(false);
      setUser(null);
      setTempUser({
        email: data.email,
        emailHash: data.emailHash
      });
    }
    // Not authenticated at all
    else {
      setIsAuthenticated(false);
      setUser(null);
      setTempUser(null);
    }
  }, []);
  
  // Function to check authentication status
  const checkAuth = useCallback(async (options = {}) => {
    // If there's already a refresh in progress, don't start another one
    if (refreshInProgress.current && !options.force) return;
    
    try {
      refreshInProgress.current = true;
      setIsLoading(true);
      
      const response = await fetch(buildApiUrl('/api/auth/status'), {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Auth status check failed: ${response.status}`);
      }
      
      const data = await response.json();
      updateAuthState(data);
      
      return data;
    } catch (err) {
      setError('Authentication check failed');
      setIsAuthenticated(false);
      setUser(null);
      setTempUser(null);
      return { isAuthenticated: false, error: err.message };
    } finally {
      setIsLoading(false);
      refreshInProgress.current = false;
    }
  }, [updateAuthState]);

  // Function to manually refresh auth state with forced refresh
  const refreshAuth = useCallback(async () => {
    return checkAuth({ force: true });
  }, [checkAuth]);

  // Initial auth check on mount
  useEffect(() => {
    checkAuth();
    // We intentionally only run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get user's initials for avatar display
  const getUserInitials = () => {
    if (!user || !user.username) return 'AS';
    
    const parts = user.username.split(/[ ._-]/);
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (user.username.length >= 2) {
      return user.username.substring(0, 2).toUpperCase();
    } else if (user.username.length === 1) {
      return (user.username[0] + user.username[0]).toUpperCase();
    }
    
    return 'AS';
  };

  // Thoroughly log out user and clean up all credentials
  const logout = async () => {
    try {
      // STEP 1: Call logout endpoint with explicit 'no-cache' headers
      const response = await fetch(buildApiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      // Wait for the response to complete
      await response.json();
      
      // STEP 2: Clean up React state
      setIsAuthenticated(false);
      setUser(null);
      setTempUser(null);
      setError(null);
      
      // STEP 3: Clean all client-side storage
      localStorage.clear();
      sessionStorage.clear();
      
      // STEP 4: Maximum cookie purge approach
      // First, handle all cookies systematically
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.trim().split('=')[0];
        if (name) { // Only process if name exists
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      
      // STEP 5: Target known authentication cookies with multiple approaches
      const cookiesToClear = ['connect.sid', 'sessionID', 'session', 'authToken', 'express:sess'];
      const paths = ['/', '/api', '/api/auth'];
      const domains = ['localhost', '', null];
      
      // Try all combinations of paths and domains for each cookie
      cookiesToClear.forEach(name => {
        paths.forEach(path => {
          domains.forEach(domain => {
            const options = [`expires=Thu, 01 Jan 1970 00:00:00 GMT`, `path=${path}`];
            if (domain) options.push(`domain=${domain}`);
            
            document.cookie = `${name}=;${options.join(';')}`;
          });
        });
      });
      
      // STEP 6: Wait a moment for processes to complete before redirect
      setTimeout(() => {
        // STEP 7: Force a complete page reload to the login page
        window.location.replace('/login');
      }, 100);
    } catch (err) {
      console.error('Logout process error:', err);
      // Still attempt cleanup and redirect on error
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    tempUser,
    refreshAuth,
    getUserInitials,
    logout
  };
};

export default useAuth;
