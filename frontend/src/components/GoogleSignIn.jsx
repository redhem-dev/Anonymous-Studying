import React from 'react';
import logo from '../assets/logo.png';
import { buildApiUrl } from '../config/apiConfig';

const GoogleSignIn = () => {
  // Function to handle Google sign-in
  const handleGoogleSignIn = () => {
    // Redirect to the backend Google auth route
    window.location.href = buildApiUrl('/auth/google');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-20 w-auto" src={logo} alt="Anonymous Studying Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Anonymous Studying
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            A platform for students to ask questions and share knowledge anonymously
          </p>
        </div>
        <div className="mt-8">
          <div className="rounded-md shadow-sm">
            <button
              onClick={handleGoogleSignIn}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-300 group-hover:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
              </span>
              Sign in with Google
            </button>
          </div>
        </div>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignIn;
