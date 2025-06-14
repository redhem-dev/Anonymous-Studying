import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';
import useUserProfile from '../hooks/useUserProfile';
import EditTicketModal from '../components/EditTicketModal';
import FavoriteButton from '../components/FavoriteButton';
import { buildApiUrl } from '../config/apiConfig';

const Account = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('settings');
  const fileInputRef = useRef(null);
  
  // Use authentication hook for user data
  const { user, getUserInitials, isAuthenticated, refreshAuth } = useAuth();
  const { userTickets, isLoading: isLoadingTickets, error: ticketsError, deleteTicket, editTicket } = useUserProfile();
  
  // Settings state
  const [settings, setSettings] = useState({});
  
  // Username update state
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  // Edit ticket modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState(null);
  
  // Favorites state
  const [favoriteTickets, setFavoriteTickets] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState(null);
  
  // Function to handle favorite removal
  const handleFavoriteChange = (ticketId, isFavorite) => {
    if (!isFavorite) {
      // Remove ticket from favorites list when unfavorited
      setFavoriteTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
    }
  };
  
  // Handle username change
  const handleUsernameChange = async () => {
    // Basic validation
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }
    
    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
      setUsernameError('Username must be 3-20 characters and can only contain letters, numbers, and underscores');
      return;
    }
    
    // Don't update if it's the same as current username
    if (newUsername === user?.username) {
      setUsernameError('New username is the same as current username');
      return;
    }
    
    try {
      setIsCheckingUsername(true);
      setUsernameError('');
      
      // First check if username is already taken
      const checkResponse = await fetch(buildApiUrl('/api/auth/check-username'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username: newUsername })
      });
      
      const checkData = await checkResponse.json();
      
      if (checkData.exists) {
        setUsernameError('Username is already taken');
        setIsCheckingUsername(false);
        return;
      }
      
      // If username is available, update it
      const updateResponse = await fetch(buildApiUrl('/api/auth/update-username'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ newUsername })
      });
      
      const updateData = await updateResponse.json();
      
      if (updateResponse.ok && updateData.success) {
        setUsernameSuccess(true);
        setNewUsername(''); // Clear the input field
        
        // Refresh auth state to update the displayed username
        await refreshAuth();
      } else {
        setUsernameError(updateData.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameError('An error occurred while updating username');
    } finally {
      setIsCheckingUsername(false);
    }
  };
  
  // Fetch user's favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingFavorites(true);
        setFavoritesError(null);
        
        const response = await fetch(buildApiUrl('/api/favorites'), {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }
        
        const data = await response.json();
        setFavoriteTickets(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavoritesError(error.message);
      } finally {
        setIsLoadingFavorites(false);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated]);
  
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
                    Current Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={user?.username || ''}
                    readOnly
                  />
                  
                  <div className="mt-4">
                    <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700">
                      New Username
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="newUsername"
                        id="newUsername"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={newUsername}
                        onChange={(e) => {
                          setNewUsername(e.target.value);
                          setUsernameError('');
                          setUsernameSuccess(false);
                        }}
                        placeholder="Enter new username"
                      />
                      <button
                        type="button"
                        onClick={handleUsernameChange}
                        disabled={isCheckingUsername || !newUsername.trim()}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingUsername ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                    {usernameError && (
                      <p className="mt-2 text-sm text-red-600">{usernameError}</p>
                    )}
                    {usernameSuccess && (
                      <p className="mt-2 text-sm text-green-600">Username updated successfully!</p>
                    )}
                  </div>
                </div>
                
                {/* Settings toggles removed */}
                
                {/* Save button removed */}
              </div>
            </div>
          )}
          
          {/* Favorites tab */}
          {activeTab === 'favorites' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Favorite Tickets</h3>
              
              {isLoadingFavorites ? (
                <div className="flex justify-center my-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : favoritesError ? (
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
                        <p>{favoritesError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : favoriteTickets.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {favoriteTickets.map((ticket) => (
                    <li key={ticket.id} className="py-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link to={`/ticket/${ticket.id}`} className="text-base font-medium text-blue-600 hover:underline">
                            {ticket.title}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            By {ticket.author_username} • {ticket.topic_name || 'General'}
                            <span className="ml-2 text-xs text-gray-400">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                            <span>{ticket.upvotes || 0} upvotes</span>
                            <span>{ticket.reply_count || 0} replies</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <FavoriteButton 
                            ticketId={ticket.id} 
                            onFavoriteChange={(isFavorite) => handleFavoriteChange(ticket.id, isFavorite)}
                          />
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
                            {/* Upvotes */}
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              {ticket.upvotes || 0}
                            </span>
                            
                            {/* Downvotes */}
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{transform: 'rotate(180deg)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              {ticket.downvotes || 0}
                            </span>
                            

                          </div>
                          
                          {/* Edit button - Only show if ticket is not resolved */}
                          {ticket.status !== 'closed' && (
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
                          )}
                          
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
