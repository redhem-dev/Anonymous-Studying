import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Account = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('settings');
  const fileInputRef = useRef(null);
  
  // Example user data
  const [user, setUser] = useState({
    username: 'johndoe',
    reputation: 450,
    joinDate: '2024-12-15',
    notificationsEnabled: true,
    darkModeEnabled: false,
    avatarUrl: 'https://ui-avatars.com/api/?name=johndoe&background=random&size=128'
  });
  
  // Example favorite tickets
  const favoriteTickets = [
    { 
      id: 1, 
      title: 'How to solve quadratic equations?', 
      topic: 'Mathematics',
      upvotes: 42, 
      downvotes: 5,
      replies: 8, 
      author: 'mathwhiz'
    },
    { 
      id: 2, 
      title: 'Understanding Big O notation', 
      topic: 'Computer Science',
      upvotes: 38, 
      downvotes: 2,
      replies: 12, 
      author: 'codemaster'
    }
  ];
  
  // Example previous tickets
  const previousTickets = [
    { 
      id: 3, 
      title: 'Help with calculus integration', 
      topic: 'Mathematics',
      upvotes: 15, 
      downvotes: 1,
      replies: 3, 
      status: 'open'
    },
    { 
      id: 4, 
      title: 'Difference between arrays and linked lists', 
      topic: 'Computer Science',
      upvotes: 22, 
      downvotes: 0,
      replies: 7, 
      status: 'closed'
    }
  ];
  
  // Handle avatar upload
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would upload the file to your server
      // For now, we'll just create a local URL to display the image
      const imageUrl = URL.createObjectURL(file);
      setUser({
        ...user,
        avatarUrl: imageUrl
      });
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Parse the tab from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['settings', 'favorites', 'tickets'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include the Navbar component */}
      <Navbar />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* User info header */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <img
              className="h-16 w-16 rounded-full mr-4 object-cover"
              src={user.avatarUrl}
              alt="User avatar"
            />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {user.username}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {user.reputation} reputation points
              </p>
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`${
                activeTab === 'favorites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer`}
            >
              Previous Tickets
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Account Settings</h3>
              
              <div className="space-y-6">
                {/* Avatar section */}
                <div className="pb-6 border-b border-gray-200">
                  <h4 className="text-base font-medium text-gray-900 mb-3">Profile Picture</h4>
                  <div className="flex items-center">
                    <div className="mr-4">
                      <img
                        src={user.avatarUrl}
                        alt="User avatar"
                        className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Change Avatar
                      </button>
                      <p className="mt-1 text-xs text-gray-500">
                        JPG, PNG or GIF. Maximum size 2MB.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Username field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    defaultValue={user.username}
                  />
                </div>
                
                {/* Notification settings */}
                <div className="flex items-center">
                  <input
                    id="notifications"
                    name="notifications"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    defaultChecked={user.notificationsEnabled}
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Enable notifications
                  </label>
                </div>
                
                {/* Dark mode settings */}
                <div className="flex items-center">
                  <input
                    id="darkMode"
                    name="darkMode"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    defaultChecked={user.darkModeEnabled}
                  />
                  <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Enable dark mode
                  </label>
                </div>
                
                {/* Save button */}
                <div>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Favorites tab */}
          {activeTab === 'favorites' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Favorite Tickets</h3>
              
              {favoriteTickets.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {favoriteTickets.map((ticket) => (
                    <li key={ticket.id} className="py-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-blue-600">{ticket.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            By {ticket.author} • {ticket.topic}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{ticket.upvotes} upvotes</span>
                          <span>{ticket.replies} replies</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">You haven't favorited any tickets yet.</p>
              )}
            </div>
          )}
          
          {/* Previous Tickets tab */}
          {activeTab === 'tickets' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Your Previous Tickets</h3>
              
              {previousTickets.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {previousTickets.map((ticket) => (
                    <li key={ticket.id} className="py-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-blue-600">{ticket.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {ticket.topic} • 
                            <span className={`ml-1 ${
                              ticket.status === 'open' ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {ticket.status}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{ticket.upvotes} upvotes</span>
                          <span>{ticket.replies} replies</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">You haven't created any tickets yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
