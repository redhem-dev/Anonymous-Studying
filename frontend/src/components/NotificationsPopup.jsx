import React from 'react';

const NotificationsPopup = ({ isOpen, onClose }) => {
  // Example notifications data
  const notifications = [
    {
      id: 1,
      type: 'reply',
      ticketTitle: 'How to solve quadratic equations?',
      user: 'mathpro',
      content: 'I added a detailed explanation about the discriminant.',
      time: '10 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'favorite',
      ticketTitle: 'Understanding Big O notation',
      user: 'algorithmexpert',
      content: 'Added a new reply with code examples.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'reply',
      ticketTitle: 'Tips for effective essay writing',
      user: 'writingtutor',
      content: 'I shared some resources that might help you.',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'favorite',
      ticketTitle: 'Newton\'s laws of motion explained',
      user: 'physicsteacher',
      content: 'Posted a detailed explanation with diagrams.',
      time: '5 hours ago',
      read: true
    },
    {
      id: 5,
      type: 'reply',
      ticketTitle: 'Help with organic chemistry nomenclature',
      user: 'chemistrywhiz',
      content: 'I answered your question about functional groups.',
      time: '1 day ago',
      read: true
    },
    {
      id: 6,
      type: 'favorite',
      ticketTitle: 'Understanding Big O notation',
      user: 'csstudent',
      content: 'Added a question about time complexity analysis.',
      time: '2 days ago',
      read: true
    },
    {
      id: 7,
      type: 'reply',
      ticketTitle: 'How to solve quadratic equations?',
      user: 'calcteacher',
      content: 'I shared an alternative approach to factoring.',
      time: '3 days ago',
      read: true
    }
  ];

  if (!isOpen) return null;

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
        
        {notifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {notification.type === 'reply' ? (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
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
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 ml-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            No notifications yet
          </div>
        )}
        
        <div className="px-4 py-2 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPopup;
