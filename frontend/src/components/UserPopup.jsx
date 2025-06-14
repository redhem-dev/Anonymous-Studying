import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { buildApiUrl } from '../config/apiConfig';

/**
 * User popup component that shows user information on hover
 * @param {Object} props - Component props
 * @param {string} props.username - Username to display info for
 * @param {React.ReactNode} props.children - Element to wrap with hover functionality
 * @returns {JSX.Element} - Rendered component
 */
const UserPopup = ({ username, children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  

  
  // Fetch user profile data when hovered
  const fetchUserProfile = async () => {
    if (userProfile) return; // Don't fetch if we already have the data
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(buildApiUrl(`/api/users/profile/${username}`), {
        withCredentials: true,
      });
      
      setUserProfile(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle hover start
  const handleMouseEnter = (event) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a timeout to prevent flickering with short hovers
    timeoutRef.current = setTimeout(() => {
      // Get position relative to the viewport
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
        // Get viewport dimensions
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Popup dimensions - make sure these match the actual component
        const popupWidth = 270;
        const popupHeight = 200;
        
        // Default position is centered horizontally and above the element
        let x = rect.left + (rect.width / 2);
        
        // Determine if showing above or below based on viewport position
        const spaceAbove = rect.top;
        const spaceBelow = windowHeight - rect.bottom;
        const showAbove = spaceAbove > popupHeight || spaceAbove > spaceBelow;
        
        // Position vertically based on available space
        let y;
        let transformValue;
        
        if (showAbove) {
          // Position above with appropriate offset
          y = rect.top - 10; // 10px gap
          transformValue = 'translate(-50%, -100%)'; // Move up by popup height
        } else {
          // Position below with appropriate offset
          y = rect.bottom + 10; // 10px gap
          transformValue = 'translate(-50%, 0)'; // Don't move vertically
        }
        
        // Adjust horizontal position if too close to screen edges
        if (x - (popupWidth / 2) < 10) {
          // Too close to left edge
          x = popupWidth / 2 + 10;
        } else if (x + (popupWidth / 2) > windowWidth - 10) {
          // Too close to right edge
          x = windowWidth - popupWidth / 2 - 10;
        }
        
        setPosition({ 
          x, 
          y,
          transformValue,
          showAbove 
        });
      }
      
      setShowPopup(true);
      fetchUserProfile();
    }, 300); // 300ms delay
  };
  
  // Handle hover end
  const handleMouseLeave = () => {
    // Clear the showing timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a timeout to hide the popup with delay
    timeoutRef.current = setTimeout(() => {
      setShowPopup(false);
      // Don't reset userProfile data so it's cached for quick re-hover
    }, 300); // 300ms delay to allow moving to popup
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Format the join date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="relative inline-block">
      {/* Trigger element wrapped with handlers */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {/* Popup - render in portal to avoid container constraints */}
      {showPopup && ReactDOM.createPortal(
        <div
          className="fixed z-[1000]" // Use a higher z-index to ensure it's always on top
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: position.transformValue || 'translate(-50%, -100%)'
          }}
          onMouseEnter={() => {
            // Clear any hiding timeout when mouse enters popup
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 w-64 text-sm overflow-visible">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : userProfile ? (
              <div>
                <div className="flex items-center mb-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${username}&background=random`}
                    alt={`${username}'s avatar`}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">{username}</h3>
                    <p className="text-xs text-gray-500">Joined {formatDate(userProfile.joinDate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded-md text-center">
                    <div className="font-bold text-blue-700">{userProfile.reputation}</div>
                    <div className="text-xs text-gray-600">Reputation</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-md text-center">
                    <div className="font-bold text-green-700">{userProfile.ticketCount}</div>
                    <div className="text-xs text-gray-600">Tickets</div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-md text-center col-span-2">
                    <div className="font-bold text-purple-700">{userProfile.replyCount}</div>
                    <div className="text-xs text-gray-600">Replies</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">User not found</div>
            )}
            {/* Arrow pointing to the trigger - positioned based on whether popup is above or below */}
            <div
              className={`absolute w-3 h-3 bg-white transform ${position.showAbove ? 'rotate-45 border-b border-r' : '-rotate-135 border-t border-l'} border-gray-200`}
              style={{
                [position.showAbove ? 'bottom' : 'top']: '-6px',
                left: '50%',
                marginLeft: '-6px'
              }}
            ></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserPopup;
