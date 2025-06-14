import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import useAuth from '../hooks/useAuth';
import { buildApiUrl } from '../config/apiConfig';

const SetUsername = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { tempUser, isLoading, isAuthenticated, refreshAuth } = useAuth();

  // Simple effect to get email and handle redirects
  useEffect(() => {
    // If user is fully authenticated, they shouldn't be on this page
    if (isAuthenticated && !tempUser) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (isLoading) return;
    
    // Get email from various sources in priority order
    let foundEmail = '';
    
    if (tempUser?.email) {
      foundEmail = tempUser.email;
    } else {
      // Try URL params
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      
      if (emailParam) {
        foundEmail = decodeURIComponent(emailParam);
        localStorage.setItem('pendingEmail', foundEmail);
      } 
      // Try location state
      else if (location.state?.email) {
        foundEmail = location.state.email;
        localStorage.setItem('pendingEmail', foundEmail);
      } 
      // Fall back to localStorage
      else {
        foundEmail = localStorage.getItem('pendingEmail') || '';
      }
    }

    if (foundEmail) {
      setEmail(foundEmail);
    } 
    // If we have no email and we're not in a loading or tempUser state, go to login
    else if (!isLoading && !tempUser) {
      navigate('/login', {
        replace: true,
        state: { error: 'Session expired. Please sign in again.' }
      });
    }
  }, [isAuthenticated, tempUser, isLoading, navigate, location]);

  // Handle username submission  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Check if username is available
      const checkResponse = await fetch(buildApiUrl('/api/auth/check-username'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include'
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setError('Username already taken. Please choose another one.');
        setLoading(false);
        return;
      }

      // Step 2: Register the user
      const registerResponse = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
        credentials: 'include'
      });

      if (!registerResponse.ok) {
        throw new Error(`Registration failed with status: ${registerResponse.status}`);
      }

      const registerData = await registerResponse.json();

      if (registerData.success) {
        // Clean up localStorage
        localStorage.removeItem('pendingEmail');
        
        // CRITICAL FIX: Force auth refresh AND direct navigation to dashboard
        await refreshAuth();
        
        // Force direct navigation regardless of auth state update
        window.location.href = '/dashboard';
        return; // Stop processing after redirect
      } else {
        throw new Error(registerData.error || 'Failed to register');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Loading overlay - white background */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg font-medium">Setting up your account...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-20 w-auto" src={logo} alt="Anonymous Studying Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose Your Username
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your registration to join Anonymous Studying
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-300 group-hover:text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              {loading ? 'Setting up your account...' : 'Continue to Dashboard'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Your username will be visible to other users
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetUsername;
