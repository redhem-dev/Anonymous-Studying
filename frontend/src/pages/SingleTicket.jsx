import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FavoriteButton from '../components/FavoriteButton';
import VoteButtons from '../components/VoteButtons';
import EditTicketModal from '../components/EditTicketModal';
import UserPopup from '../components/UserPopup';
import useAuth from '../hooks/useAuth';
import useUpdateTicket from '../hooks/useUpdateTicket';
import axios from 'axios';
import { buildApiUrl } from '../config/apiConfig';

const SingleTicket = () => {
  const { ticketId } = useParams();
  const [replyContent, setReplyContent] = useState('');
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyError, setReplyError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { updateTicket } = useUpdateTicket();
  const [ticketVotes, setTicketVotes] = useState({});
  const [replyVotes, setReplyVotes] = useState({});
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the ticket
        const ticketResponse = await fetch(buildApiUrl(`/api/tickets/${ticketId}`), {
          credentials: 'include'
        });
        
        if (!ticketResponse.ok) {
          throw new Error('Failed to load ticket');
        }
        
        const ticketData = await ticketResponse.json();
        setTicket(ticketData);
        
        // Fetch the replies
        const repliesResponse = await fetch(buildApiUrl(`/api/tickets/${ticketId}/replies`), {
          credentials: 'include'
        });
        
        if (!repliesResponse.ok) {
          throw new Error('Failed to load replies');
        }
        
        const repliesData = await repliesResponse.json();
        setReplies(repliesData);

        // If user is authenticated, fetch their votes
        if (isAuthenticated) {
          try {
            // Fetch ticket votes
            const ticketVotesResponse = await fetch(buildApiUrl('/api/tickets/user/votes'), {
              credentials: 'include'
            });
            const ticketVotesData = await ticketVotesResponse.json();
            setTicketVotes(ticketVotesData);
            
            // Fetch reply votes from our new endpoint
            const replyVotesResponse = await fetch(buildApiUrl('/api/tickets/user/reply-votes'), {
              credentials: 'include'
            });
            const replyVotesData = await replyVotesResponse.json();
            setReplyVotes(replyVotesData);
          } catch (voteError) {
            console.error('Error fetching user votes:', voteError);
            // Initialize with empty objects if there's an error
            setTicketVotes({});
            setReplyVotes({});
          }
        } else {
          // Reset votes when not authenticated
          setTicketVotes({});
          setReplyVotes({});
        }
      } catch (err) {
        console.error('Error fetching ticket data:', err);
        setError(err.message);
        
        // Use demo data if API fails (for development purposes)
        setTicket({
          id: parseInt(ticketId),
          title: 'How to solve quadratic equations?',
          body: 'I\'m struggling with solving quadratic equations, especially when factoring doesn\'t work easily. Can someone explain the quadratic formula and when to use different methods?',
          topic_name: 'Mathematics',
          upvotes: 42,
          downvotes: 5,
          author_username: 'mathwhiz',
          created_at: '2025-04-15T14:30:00Z',
          tags: ['mathematics', 'algebra', 'quadratic-equations']
        });
        
        setReplies([
          {
            id: 1,
            author_username: 'mathpro',
            body: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a for the equation ax² + bx + c = 0.',
            created_at: '2025-04-15T15:45:00Z',
            upvotes: 18,
            downvotes: 1,
            is_accepted: true
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicketData();
  }, [ticketId, isAuthenticated]);
  
  // Handle reply submission
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!replyContent.trim()) {
      setReplyError('Reply cannot be empty');
      return;
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setReplyError('You must be logged in to reply');
      return;
    }
    
    setIsSubmitting(true);
    setReplyError(null);
    
    try {
      // Send the reply to the backend
      const response = await fetch(buildApiUrl(`/api/tickets/${ticketId}/replies`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          body: replyContent,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit reply');
      }
      
      // Reset form
      setReplyContent('');
      
      // Fetch updated replies
      const repliesResponse = await fetch(buildApiUrl(`/api/tickets/${ticketId}/replies`), {
        credentials: 'include'
      });
      
      if (!repliesResponse.ok) {
        throw new Error('Failed to refresh replies');
      }
      
      const repliesData = await repliesResponse.json();
      setReplies(repliesData);
      
    } catch (err) {
      console.error('Error submitting reply:', err);
      setReplyError(err.message || 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle accepting an answer
  const handleAcceptAnswer = async (replyId) => {
    if (!isAuthenticated || !ticket || user.id !== ticket.author_id) {

      return;
    }
    
    try {

      const response = await fetch(buildApiUrl(`/api/tickets/${ticketId}/replies/${replyId}/accept`), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Failed to accept answer');
      }
      
      const result = await response.json();

      
      // Update local state
      setTicket(prev => ({ ...prev, status: 'closed' }));
      setReplies(prev => prev.map(reply => {
        if (reply.id === replyId) {
          return { ...reply, is_accepted: 1 };
        }
        return reply;
      }));
      
    } catch (err) {
      console.error('Error accepting answer:', err);
    }
  };

  const handleSaveTicket = async (ticketId, formData) => {
    try {
      await updateTicket(ticketId, formData);
      
      // Update the ticket in the UI
      setTicket(prev => ({
        ...prev,
        title: formData.title,
        body: formData.body,
        topic_id: formData.topic_id,
        tags: formData.tags
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating ticket:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include the Navbar component */}
      <Navbar />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
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

        {/* Ticket content */}
        {!isLoading && ticket && (
          <div className="space-y-6">
            {/* Ticket header */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {ticket.title}
                  {ticket.status === 'closed' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Resolved
                    </span>
                  )}
                </h1>
                <div className="flex items-center space-x-3">
                  {isAuthenticated && user && ticket.author_id === user.id && ticket.status !== 'closed' && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  <FavoriteButton ticketId={ticket.id} size="2x" />
                </div>
              </div>
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                <span>Asked {formatDate(ticket.created_at)}</span>
                <span>by <UserPopup username={ticket.author_username}>
                  <span className="font-medium text-gray-700 cursor-pointer">{ticket.author_username}</span>
                </UserPopup></span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {ticket.topic_name}
                </span>
              </div>
            </div>
            
            {/* Main ticket */}
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div className="px-4 py-5 sm:px-6">
                {/* Header with author and topic */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <UserPopup username={ticket.author_username}>
                      <div className="flex items-center cursor-pointer">
                        <img
                          className="h-8 w-8 rounded-full mr-2 hover:opacity-80"
                          src={`https://ui-avatars.com/api/?name=${ticket.author_username}&background=random`}
                          alt={`${ticket.author_username}'s avatar`}
                        />
                        <span className="text-sm font-medium text-gray-700">{ticket.author_username}</span>
                      </div>
                    </UserPopup>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">
                    {ticket.topic_name}
                  </span>
                </div>
                
                {/* Content */}
                <p className="text-gray-700 mb-4 whitespace-pre-line">
                  {ticket.body}
                </p>
                
                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="mt-4 mb-4 flex flex-wrap gap-2">
                    {ticket.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Footer with stats */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                  
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
                      setTicket(prev => {
                        const updated = {...prev};
                        
                        // Case 1: Removing a vote (clicking the same vote type again)
                        if (newVoteType === null) {
                          if (prevVoteType === 'upvote') {
                            updated.upvotes = Math.max(0, prev.upvotes - 1);
                          } else if (prevVoteType === 'downvote') {
                            updated.downvotes = Math.max(0, prev.downvotes - 1);
                          }
                        }
                        // Case 2: Adding a new vote (no previous vote)
                        else if (prevVoteType === null) {
                          if (newVoteType === 'upvote') {
                            updated.upvotes = prev.upvotes + 1;
                          } else if (newVoteType === 'downvote') {
                            updated.downvotes = prev.downvotes + 1;
                          }
                        }
                        // Case 3: Changing vote type
                        else if (prevVoteType !== newVoteType) {
                          if (newVoteType === 'upvote') {
                            // Changing from downvote to upvote
                            updated.upvotes = prev.upvotes + 1;
                            updated.downvotes = Math.max(0, prev.downvotes - 1);
                          } else if (newVoteType === 'downvote') {
                            // Changing from upvote to downvote
                            updated.upvotes = Math.max(0, prev.upvotes - 1);
                            updated.downvotes = prev.downvotes + 1;
                          }
                        }
                        
                        return updated;
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Reply count */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">{replies.length} Replies</h2>
            
            {/* Replies */}
            <div className="space-y-4 ml-8">
              {replies.map((reply) => (
                <div 
                  key={reply.id} 
                  className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 ${reply.is_accepted ? 'border-l-4 border-green-500' : ''}`}
                >
                  <div className="px-4 py-5 sm:px-6">
                    {/* Header with author */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <UserPopup username={reply.author_username}>
                          <div className="flex items-center cursor-pointer">
                            <img
                              className="h-8 w-8 rounded-full mr-2 hover:opacity-80"
                              src={`https://ui-avatars.com/api/?name=${reply.author_username}&background=random`}
                              alt={`${reply.author_username}'s avatar`}
                            />
                            <span className="text-sm font-medium text-gray-700">{reply.author_username}</span>
                          </div>
                        </UserPopup>
                      </div>
                      <div className="flex items-center">
                        {/* Only show Accept Answer button if ticket status is not resolved and current user is author */}
                        {
                         ticket.status === 'open' && 
                         user.id === ticket.author_id && 
                         reply.is_accepted === 0 &&
                        (
                          <button 
                            onClick={() => handleAcceptAnswer(reply.id)}
                            className="mr-2 px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            Accept as Answer
                          </button>
                        )}
                        {reply.is_accepted ===  1 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Accepted Answer
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <p className="text-gray-700 mb-4 whitespace-pre-line">
                      {reply.body}
                    </p>
                    
                    {/* Footer with stats */}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <span>{formatDate(reply.created_at)}</span>
                      </div>
                      
                      <VoteButtons 
                        itemId={{ ticketId: ticket.id, replyId: reply.id }}
                        itemType="reply"
                        upvotes={reply.upvotes}
                        downvotes={reply.downvotes}
                        userVote={replyVotes[reply.id]}
                        onVoteChange={(newVoteType, prevVoteType) => {
                          // Update user vote state
                          setReplyVotes(prevVotes => {
                            const updatedVotes = {...prevVotes};
                            
                            if (newVoteType === null) {
                              // Remove the vote
                              delete updatedVotes[reply.id];
                            } else {
                              // Add or change vote
                              updatedVotes[reply.id] = newVoteType;
                            }
                            
                            return updatedVotes;
                          });
                          
                          // Update reply vote counts
                          setReplies(prev => prev.map(r => {
                            if (r.id !== reply.id) return r;
                            
                            const updated = {...r};
                            
                            // Case 1: Removing a vote (clicking the same vote type again)
                            if (newVoteType === null) {
                              if (prevVoteType === 'upvote') {
                                updated.upvotes = Math.max(0, r.upvotes - 1);
                              } else if (prevVoteType === 'downvote') {
                                updated.downvotes = Math.max(0, r.downvotes - 1);
                              }
                            }
                            // Case 2: Adding a new vote (no previous vote)
                            else if (prevVoteType === null) {
                              if (newVoteType === 'upvote') {
                                updated.upvotes = r.upvotes + 1;
                              } else if (newVoteType === 'downvote') {
                                updated.downvotes = r.downvotes + 1;
                              }
                            }
                            // Case 3: Changing vote type
                            else if (prevVoteType !== newVoteType) {
                              if (newVoteType === 'upvote') {
                                // Changing from downvote to upvote
                                updated.upvotes = r.upvotes + 1;
                                updated.downvotes = Math.max(0, r.downvotes - 1);
                              } else if (newVoteType === 'downvote') {
                                // Changing from upvote to downvote
                                updated.upvotes = Math.max(0, r.upvotes - 1);
                                updated.downvotes = r.downvotes + 1;
                              }
                            }
                            
                            return updated;
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add reply form - Only show if the ticket is not resolved */}
            {ticket.status === 'open' ? (
              <div className="bg-white mt-6 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Add Reply</h3>
                  {isAuthenticated ? (
                    <form className="mt-4" onSubmit={handleSubmitReply}>
                      {/* Current user info */}
                      {user && (
                        <div className="flex items-center mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                          <img
                            className="h-10 w-10 rounded-full mr-3 border-2 border-white shadow-sm"
                            src={`https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&background=2563EB`}
                            alt={`${user.username}'s avatar`}
                          />
                          <div>
                            <span className="block text-sm font-medium text-gray-900">Posting as:</span>
                            <span className="block text-base font-semibold text-blue-700">{user.username}</span>
                          </div>
                        </div>
                      )}
                      {replyError && (
                        <div className="mb-4 bg-red-50 p-2 rounded-md">
                          <p className="text-sm text-red-700">{replyError}</p>
                        </div>
                      )}
                      <div>
                        <textarea
                          rows="4"
                          className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                          placeholder="Write your answer here..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          disabled={isSubmitting}
                        ></textarea>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Posting...
                            </>
                          ) : (
                            'Post Reply'
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md text-center">
                      <p className="text-gray-600">You need to be logged in to reply to this ticket.</p>
                      <a href="/login" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                        Sign in to reply
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-700 font-medium">This ticket has been resolved with an accepted answer.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Ticket Modal */}
      <EditTicketModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ticket={ticket}
        onSave={handleSaveTicket}
      />
    </div>
  );
};

export default SingleTicket;
