import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  // Use authentication hook for user data and logout functionality
  const { user, isLoading, getUserInitials, logout } = useAuth();

  return (
    <>
      {/* Sidebar overlay - full screen with higher z-index */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        {/* Sidebar panel */}
        <div onClick={e => e.stopPropagation()} 
          className={`fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-5">
            {/* Close button */}
            <div className="flex justify-end">
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* User info */}
            <div className="flex flex-col items-center mt-5 mb-8">
              <div 
                className="h-20 w-20 rounded-full flex items-center justify-center bg-gray-800 text-white text-3xl font-bold mb-3"
              >
                {getUserInitials()}
              </div>
              <h3 className="text-xl font-medium text-gray-900">{isLoading ? 'Loading...' : user?.username || 'Anonymous'}</h3>
              <p className="text-sm text-gray-500">{isLoading ? '...' : (user?.reputation || 0)} reputation points</p>
            </div>
            
            {/* Navigation links */}
            <nav className="mt-8">
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/account?tab=settings" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                    onClick={onClose}
                  >
                    Your Account
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/account?tab=favorites" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                    onClick={onClose}
                  >
                    Favorites
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/account?tab=tickets" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                    onClick={onClose}
                  >
                    Previous Tickets
                  </Link>
                </li>
              </ul>
            </nav>
            
            {/* Logout button */}
            <div className="mt-auto pt-8">
              <button 
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Call logout explicitly and handle any errors
                  try {
                    logout();
                  } catch (err) {
                    console.error('Logout failed:', err);
                    // Force redirect as fallback
                    window.location.href = '/login';
                  }
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
