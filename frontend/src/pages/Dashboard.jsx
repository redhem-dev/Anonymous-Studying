import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CreateTicketModal from '../components/CreateTicketModal';
import FavoriteButton from '../components/FavoriteButton';
import VoteButtons from '../components/VoteButtons';
import useAuth from '../hooks/useAuth';
import useTickets from '../hooks/useTickets';

const Dashboard = () => {
  // State for create ticket modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // State for tickets and votes
  const [tickets, setTickets] = useState([]);
  const [ticketVotes, setTicketVotes] = useState({});
  
  // Use our custom hook to fetch tickets
  const { isLoading, error, refreshTickets } = useTickets();
  
  // Use auth hook to get authentication status
  const { isAuthenticated } = useAuth();
  
  // Handle modal close and refresh tickets
  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    // Refresh tickets when modal closes to ensure new tickets are displayed
    refreshTickets();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tickets
        const ticketsResponse = await axios.get('http://localhost:3000/api/tickets');
        setTickets(ticketsResponse.data);
        
        // If authenticated, fetch user's votes
        if (isAuthenticated) {
          try {
            const votesResponse = await fetch('http://localhost:3000/api/tickets/user/votes', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json'
              }
            });
            
            if (!votesResponse.ok) {
              throw new Error(`Error fetching votes: ${votesResponse.status}`);
            }
            
            const votesData = await votesResponse.json();
            setTicketVotes(votesData);
          } catch (error) {
            console.error('Error fetching user votes:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include the Navbar component */}
      <Navbar />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New Ticket
            </button>
          </div>
        </div>


        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
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
        )}

        {/* Tickets Wall */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {tickets.length === 0 ? (
              <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new ticket.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                  <div className="px-4 py-5 sm:px-6">
                    {/* Header with author and topic */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full mr-2 cursor-pointer hover:opacity-80"
                          src={`https://ui-avatars.com/api/?name=${ticket.author_username || 'Anonymous'}&background=random`}
                          alt={`${ticket.author_username || 'Anonymous'}'s avatar`}
                          onClick={() => console.log('Navigate to user profile:', ticket.author_username)}
                        />
                        <span className="text-sm font-medium text-gray-700">{ticket.author_username || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FavoriteButton 
                          ticketId={ticket.id} 
                          size="lg" 
                          className="mr-2"
                        />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ticket.topic_name || 'General'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Title with link */}
                    <Link to={`/ticket/${ticket.id}`} className="block">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2 hover:text-blue-600">
                        {ticket.title}
                      </h3>
                      
                      {/* Content preview */}
                      <p className="text-sm text-gray-500 mb-4">
                        {ticket.body}
                      </p>
                    </Link>
                    
                    {/* Footer with stats */}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <Link to={`/ticket/${ticket.id}`} className="flex items-center hover:text-gray-700">
                        <svg className="h-5 w-5 mr-1 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <span>Replies</span>
                      </Link>
                      
                      <div className="flex items-center space-x-4">
                        {/* Vote buttons component */}
                        <VoteButtons 
                          itemId={ticket.id}
                          itemType="ticket"
                          upvotes={ticket.upvotes}
                          downvotes={ticket.downvotes}
                          userVote={ticketVotes[ticket.id]}
                          onVoteChange={(newVoteType, prevVoteType) => {
                            // Update user vote state
                            setTicketVotes(prevVotes => {
                              const updatedVotes = {...prevVotes};
                              
                              if (newVoteType === null) {
                                // Remove the vote
                                delete updatedVotes[ticket.id];
                              } else {
                                // Add or change vote
                                updatedVotes[ticket.id] = newVoteType;
                              }
                              
                              return updatedVotes;
                            });
                            
                            // Update ticket vote counts
                            setTickets(prev => prev.map(t => {
                              if (t.id !== ticket.id) return t;
                              
                              const updated = {...t};
                              
                              // Case 1: Removing a vote (clicking the same vote type again)
                              if (newVoteType === null) {
                                if (prevVoteType === 'upvote') {
                                  updated.upvotes = Math.max(0, t.upvotes - 1);
                                } else if (prevVoteType === 'downvote') {
                                  updated.downvotes = Math.max(0, t.downvotes - 1);
                                }
                              }
                              // Case 2: Adding a new vote (no previous vote)
                              else if (prevVoteType === null) {
                                if (newVoteType === 'upvote') {
                                  updated.upvotes = t.upvotes + 1;
                                } else if (newVoteType === 'downvote') {
                                  updated.downvotes = t.downvotes + 1;
                                }
                              }
                              // Case 3: Changing vote type
                              else if (prevVoteType !== newVoteType) {
                                if (newVoteType === 'upvote') {
                                  // Changing from downvote to upvote
                                  updated.upvotes = t.upvotes + 1;
                                  updated.downvotes = Math.max(0, t.downvotes - 1);
                                } else if (newVoteType === 'downvote') {
                                  // Changing from upvote to downvote
                                  updated.upvotes = Math.max(0, t.upvotes - 1);
                                  updated.downvotes = t.downvotes + 1;
                                }
                              }
                              
                              return updated;
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Create Ticket Modal */}
      <CreateTicketModal 
        isOpen={isCreateModalOpen} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default Dashboard;
