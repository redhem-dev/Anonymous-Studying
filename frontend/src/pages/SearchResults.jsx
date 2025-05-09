import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useTickets from '../hooks/useTickets';

const SearchResults = () => {
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q') || '';
  const { searchResults, isSearching, error, searchTickets } = useTickets();
  
  // Trigger search when component mounts or search query changes
  useEffect(() => {
    if (searchQuery) {
      searchTickets(searchQuery);
    }
    // searchTickets is intentionally omitted from the dependency array to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include the Navbar component */}
      <Navbar />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Search Results for "{searchQuery}"
            </h2>
          </div>
        </div>

        {isSearching ? (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
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
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>

            {/* Display tickets */}
            {searchResults.tickets && searchResults.tickets.length > 0 ? (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Tickets</h3>
                <div className="space-y-6">
                  {searchResults.tickets.map((ticket) => (
                    <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="block">
                      <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer">
                        <div className="px-4 py-5 sm:px-6">
                          {/* Header with author and topic */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <img
                                className="h-8 w-8 rounded-full mr-2 cursor-pointer hover:opacity-80"
                                src={`https://ui-avatars.com/api/?name=${ticket.author_username || 'Anonymous'}&background=random`}
                                alt={`${ticket.author_username || 'Anonymous'}'s avatar`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  // In a real app, navigate to user profile
                                  console.log('Navigate to user profile:', ticket.author_username);
                                }}
                              />
                              <span className="text-sm font-medium text-gray-700">{ticket.author_username || 'Anonymous'}</span>
                            </div>
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                              onClick={(e) => {
                                e.preventDefault();
                                // In a real app, filter by topic
                                console.log('Filter by topic:', ticket.topic_name);
                              }}
                            >
                              {ticket.topic_name || 'General'}
                            </span>
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                            {ticket.title}
                          </h3>
                          
                          {/* Content */}
                          <p className="text-sm text-gray-500 mb-4">
                            {ticket.body}
                          </p>
                          
                          {/* Footer with stats */}
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <div className="flex items-center cursor-pointer hover:text-gray-700">
                              <svg className="h-5 w-5 mr-1 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                              </svg>
                              <span>Replies</span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center cursor-pointer hover:text-gray-900 group">
                                <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                <span className="font-medium">{ticket.upvotes || 0}</span>
                              </div>
                              
                              <div className="flex items-center cursor-pointer hover:text-gray-900 group">
                                <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                </svg>
                                <span className="font-medium">{ticket.downvotes || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-500">No tickets found matching "{searchQuery}"</p>
              </div>
            )}

            {/* No results message */}
            {(!searchResults.tickets || searchResults.tickets.length === 0) && (
              <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">We couldn't find anything matching "{searchQuery}".</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
