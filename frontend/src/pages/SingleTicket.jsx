import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FavoriteButton from '../components/FavoriteButton';

const SingleTicket = () => {
  const { ticketId } = useParams();
  const [replyContent, setReplyContent] = useState('');
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch ticket data
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the ticket
        const ticketResponse = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
          credentials: 'include'
        });
        
        if (!ticketResponse.ok) {
          throw new Error('Failed to load ticket');
        }
        
        const ticketData = await ticketResponse.json();
        setTicket(ticketData);
        
        // Fetch the replies
        const repliesResponse = await fetch(`http://localhost:3000/api/tickets/${ticketId}/replies`, {
          credentials: 'include'
        });
        
        if (!repliesResponse.ok) {
          throw new Error('Failed to load replies');
        }
        
        const repliesData = await repliesResponse.json();
        setReplies(repliesData);
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
  }, [ticketId]);
  
  // Handle reply submission
  const handleSubmitReply = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Submitting reply:', replyContent);
    // Reset form
    setReplyContent('');
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
          <>
            {/* Ticket header */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                <FavoriteButton ticketId={ticket.id} size="2x" />
              </div>
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                <span>Asked {formatDate(ticket.created_at)}</span>
                <span>by <span className="font-medium text-gray-700">{ticket.author_username}</span></span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {ticket.topic_name}
                </span>
              </div>
            </div>
          </>
        )}
        
        {/* Ticket and replies container */}
        {!isLoading && ticket && (
          <div className="space-y-6">
            {/* Main ticket */}
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div className="px-4 py-5 sm:px-6">
                {/* Header with author and topic */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full mr-2 cursor-pointer hover:opacity-80"
                      src={`https://ui-avatars.com/api/?name=${ticket.author_username}&background=random`}
                      alt={`${ticket.author_username}'s avatar`}
                    />
                    <span className="text-sm font-medium text-gray-700">{ticket.author_username}</span>
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
                        <img
                          className="h-8 w-8 rounded-full mr-2 cursor-pointer hover:opacity-80"
                          src={`https://ui-avatars.com/api/?name=${reply.author_username}&background=random`}
                          alt={`${reply.author_username}'s avatar`}
                        />
                        <span className="text-sm font-medium text-gray-700">{reply.author_username}</span>
                      </div>
                      {reply.is_accepted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Accepted Answer
                        </span>
                      )}
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
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center cursor-pointer hover:text-gray-900 group">
                          <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span className="font-medium">{reply.upvotes || 0}</span>
                        </div>

                        <div className="flex items-center cursor-pointer hover:text-gray-900 group">
                          <svg
                            className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                          <span className="font-medium">{reply.downvotes}</span>
                        </div>

                        {!reply.is_accepted && (
                          <button className="text-gray-400 hover:text-green-500 cursor-pointer">
                            <svg
                              className="h-6 w-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add reply form */}
            <div className="bg-white mt-6 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add Reply</h3>
                <form className="mt-4" onSubmit={handleSubmitReply}>
                  <div>
                    <textarea
                      rows="4"
                      className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                      placeholder="Write your answer here..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Post Reply
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleTicket;
