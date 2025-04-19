import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SingleTicket = () => {
  const { ticketId } = useParams();
  const [replyContent, setReplyContent] = useState('');
  
  // Example ticket data (in a real app, you would fetch this based on ticketId)
  const ticket = {
    id: 1,
    title: 'How to solve quadratic equations?',
    content: 'I\'m struggling with solving quadratic equations, especially when factoring doesn\'t work easily. Can someone explain the quadratic formula and when to use different methods? I understand that ax² + bx + c = 0 is the standard form, but I get confused about when to use the quadratic formula versus completing the square or other methods.\n\nAlso, are there any good online resources or tools that can help me practice these problems? I have an exam coming up next week and really need to master this concept.',
    topic: 'Mathematics',
    upvotes: 42,
    downvotes: 5,
    replies: 4,
    author: 'mathwhiz',
    createdAt: '2025-04-15T14:30:00Z',
    tags: ['mathematics', 'algebra', 'quadratic-equations']
  };
  
  // Example replies
  const replies = [
    {
      id: 1,
      author: 'mathpro',
      content: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a for the equation ax² + bx + c = 0. You should use it when factoring isn\'t straightforward.\n\nFactoring works well for simpler expressions, but the quadratic formula always works for any quadratic equation. The discriminant (b² - 4ac) tells you about the nature of the roots:\n- If b² - 4ac > 0, there are two real roots\n- If b² - 4ac = 0, there is one real root (repeated)\n- If b² - 4ac < 0, there are two complex roots',
      createdAt: '2025-04-15T15:45:00Z',
      upvotes: 18,
      downvotes: 1,
      isAccepted: true
    },
    {
      id: 2,
      author: 'algebralover',
      content: 'I recommend using the completing the square method when you need to convert to vertex form. It\'s particularly useful for graphing parabolas. For just finding roots, the quadratic formula is usually faster.',
      createdAt: '2025-04-15T16:30:00Z',
      upvotes: 7,
      downvotes: 0,
      isAccepted: false
    },
    {
      id: 3,
      author: 'calcteacher',
      content: 'For practice, I recommend Khan Academy\'s quadratic equation section. They have interactive problems and step-by-step solutions that are really helpful.',
      createdAt: '2025-04-16T09:15:00Z',
      upvotes: 12,
      downvotes: 0,
      isAccepted: false
    },
    {
      id: 4,
      author: 'mathtutorpro',
      content: 'Here\'s a quick tip: if your quadratic is in the form x² + bx + c (where a=1), you can look for two numbers that multiply to give c and add to give b. Those numbers will help you factor the expression easily.',
      createdAt: '2025-04-16T14:20:00Z',
      upvotes: 9,
      downvotes: 2,
      isAccepted: false
    }
  ];
  
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
        {/* Ticket header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
            <span>Asked {formatDate(ticket.createdAt)}</span>
            <span>by <span className="font-medium text-gray-700">{ticket.author}</span></span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {ticket.topic}
            </span>
          </div>
        </div>
        
        {/* Ticket and replies container */}
        <div className="space-y-6">
          {/* Main ticket */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="px-4 py-5 sm:px-6">
              {/* Header with author and topic */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full mr-2 cursor-pointer hover:opacity-80"
                    src={`https://ui-avatars.com/api/?name=${ticket.author}&background=random`}
                    alt={`${ticket.author}'s avatar`}
                  />
                  <span className="text-sm font-medium text-gray-700">{ticket.author}</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">
                  {ticket.topic}
                </span>
              </div>
              
              {/* Content */}
              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {ticket.content}
              </p>
              
              {/* Tags */}
              <div className="mt-4 mb-4 flex flex-wrap gap-2">
                {ticket.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Footer with stats */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center cursor-pointer hover:text-gray-900 group">
                    <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="font-medium">{ticket.upvotes}</span>
                  </div>
                  
                  <div className="flex items-center cursor-pointer hover:text-gray-900 group">
                    <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    <span className="font-medium">{ticket.downvotes}</span>
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
                className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 ${reply.isAccepted ? 'border-l-4 border-green-500' : ''}`}
              >
                <div className="px-4 py-5 sm:px-6">
                  {/* Header with author */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full mr-2 cursor-pointer hover:opacity-80"
                        src={`https://ui-avatars.com/api/?name=${reply.author}&background=random`}
                        alt={`${reply.author}'s avatar`}
                      />
                      <span className="text-sm font-medium text-gray-700">{reply.author}</span>
                    </div>
                    {reply.isAccepted && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Accepted Answer
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <p className="text-gray-700 mb-4 whitespace-pre-line">
                    {reply.content}
                  </p>
                  
                  {/* Footer with stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <span>{formatDate(reply.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center cursor-pointer hover:text-gray-900 group">
                        <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="font-medium">{reply.upvotes}</span>
                      </div>
                      
                      <div className="flex items-center cursor-pointer hover:text-gray-900 group">
                        <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        <span className="font-medium">{reply.downvotes}</span>
                      </div>
                      
                      {!reply.isAccepted && (
                        <button className="text-gray-400 hover:text-green-500 cursor-pointer">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Reply</h3>
              <form onSubmit={handleSubmitReply}>
                <div className="mb-4">
                  <textarea
                    rows="6"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Write your reply here..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    Post Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTicket;
