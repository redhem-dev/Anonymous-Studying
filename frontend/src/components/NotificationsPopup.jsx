import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPopup = ({ isOpen, onClose, notifications = [], loading = false, onMarkAllAsRead }) => {
  if (!isOpen) return null;
  
  // Format the timestamp to relative time (e.g., "2 hours ago")
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };
  
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
      <div className="py-2">
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            <svg className="animate-spin h-5 w-5 mx-auto mb-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <Link
                to={`/ticket/${notification.ticketId}`} 
                key={notification.id} 
                className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 bg-blue-50"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.user}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.ticketTitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTime(notification.time)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            No new notifications
          </div>
        )}
        
        <div className="px-4 py-2 border-t border-gray-200">
          <button 
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer w-full text-center"
            disabled={loading}
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPopup;
