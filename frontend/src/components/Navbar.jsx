import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import Sidebar from './Sidebar';
import NotificationsPopup from './NotificationsPopup';

const Navbar = () => {
  // Example notification count
  const notificationCount = 3;
  
  // State for sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for notifications popup visibility
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Ref for notifications popup container
  const notificationsRef = useRef(null);
  
  // Handle clicks outside of notifications popup to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    
    // Add event listener when notifications are open
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);
  
  return (
    <>
      <nav className="bg-white shadow-md px-4 py-2 flex items-center justify-between">
        {/* Logo on the left - clickable to dashboard */}
        <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
          <img src={logo} alt="Anonymous Studying Logo" className="h-10" />
          <span className="ml-2 text-xl font-bold text-gray-800">Anonymous Studying</span>
        </Link>
        
        {/* Search bar in the middle */}
        <div className="max-w-md w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search for topics, questions, or tags..."
            />
          </div>
        </div>
        
        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationsRef}>
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
            
            {/* Notifications Popup */}
            <NotificationsPopup 
              isOpen={notificationsOpen} 
              onClose={() => setNotificationsOpen(false)} 
            />
          </div>
          
          {/* User Avatar - Click to toggle sidebar */}
          <div className="relative">
            <button 
              className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out cursor-pointer hover:opacity-80"
              onClick={() => setSidebarOpen(true)}
            >
              <img
                className="h-8 w-8 rounded-full object-cover"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar"
              />
            </button>
          </div>
        </div>
      </nav>
      
      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
