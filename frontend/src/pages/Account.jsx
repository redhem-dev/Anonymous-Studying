import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';
import useUserProfile from '../hooks/useUserProfile';
import EditTicketModal from '../components/EditTicketModal';

const Account = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('settings');
  const fileInputRef = useRef(null);
  
  // Use authentication hook for user data
  const { user, getUserInitials } = useAuth();
  const { userTickets, isLoading: isLoadingTickets, error: ticketsError, deleteTicket, editTicket } = useUserProfile();
  
  // Settings state
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    darkModeEnabled: false
  });
  
  // Edit ticket modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState(null);
  
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
  
  // Handle edit ticket callback
  const handleTicketEdit = async (ticketId, formData) => {
    const success = await editTicket(ticketId, formData);
    return success;
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
            <div 
              className="h-16 w-16 rounded-full mr-4 flex items-center justify-center bg-gray-800 text-white text-xl font-bold"
            >
              {getUserInitials()}
            </div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {user?.username || 'Anonymous User'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {user?.reputation || 0} reputation points
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
                      <div 
                        className="h-24 w-24 rounded-full flex items-center justify-center bg-gray-800 text-white text-3xl font-bold border-2 border-gray-200"
                      >
                        {getUserInitials()}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Your avatar is automatically generated from your username.
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
                    value={user?.username || ''}
                    readOnly
                  />
                </div>
                
                {/* Notification settings */}
                <div className="flex items-center">
                  <input
                    id="notifications"
                    name="notifications"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    checked={settings.notificationsEnabled}
                    onChange={() => setSettings(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
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
                    checked={settings.darkModeEnabled}
                    onChange={() => setSettings(prev => ({ ...prev, darkModeEnabled: !prev.darkModeEnabled }))}
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
              
              {isLoadingTickets ? (
                <div className="flex justify-center my-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : ticketsError ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{ticketsError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : userTickets.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {userTickets.map((ticket) => (
                    <li key={ticket.id} className="py-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <Link to={`/ticket/${ticket.id}`} className="text-base font-medium text-blue-600 hover:underline">
                            {ticket.title}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            {ticket.topic_name || 'General'} • 
                            <span className={`ml-1 ${
                              ticket.status === 'closed' ? 'text-gray-600' : 'text-green-600'
                            }`}>
                              {ticket.status || 'open'}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* View count and replies */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mr-4">
                            <span>{ticket.upvotes || 0} upvotes</span>
                            <span>{ticket.reply_count || 0} replies</span>
                          </div>
                          
                          {/* Edit button */}
                          <button 
                            onClick={() => {
                              setTicketToEdit(ticket);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none"
                            title="Edit ticket"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Delete button */}
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this ticket?')) {
                                deleteTicket(ticket.id);
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-red-500 focus:outline-none"
                            title="Delete ticket"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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
      
      {/* Edit Ticket Modal */}
      {isEditModalOpen && (
        <EditTicketModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          ticket={ticketToEdit}
          onSave={editTicket}
        />
      )}
    </div>
  );
};

export default Account;
