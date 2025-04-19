import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CreateTicketModal from '../components/CreateTicketModal';

const Dashboard = () => {
  // State for create ticket modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Example data for tickets wall
  const tickets = [
    { 
      id: 1, 
      title: 'How to solve quadratic equations?', 
      content: 'I\'m struggling with solving quadratic equations, especially when factoring doesn\'t work easily. Can someone explain the quadratic formula and when to use different methods?',
      topic: 'Mathematics',
      upvotes: 42, 
      downvotes: 5,
      replies: 8, 
      author: 'mathwhiz',
      createdAt: '2025-04-15T14:30:00Z'
    },
    { 
      id: 2, 
      title: 'Understanding Big O notation', 
      content: 'I\'m trying to understand time complexity and Big O notation for my algorithms class. Can someone explain the difference between O(n), O(n log n), and O(n²) with examples?',
      topic: 'Computer Science',
      upvotes: 38, 
      downvotes: 2,
      replies: 12, 
      author: 'codemaster',
      createdAt: '2025-04-16T09:15:00Z'
    },
    { 
      id: 3, 
      title: 'Newton\'s laws of motion explained', 
      content: 'I need help understanding Newton\'s three laws of motion and how they relate to each other. Especially the third law about equal and opposite reactions - could someone provide real-world examples?',
      topic: 'Physics',
      upvotes: 35, 
      downvotes: 3,
      replies: 6, 
      author: 'physicsgeek',
      createdAt: '2025-04-17T11:45:00Z'
    },
    { 
      id: 4, 
      title: 'Tips for effective essay writing', 
      content: 'I have a 2000-word essay due next week and I\'m struggling with structure and flow. Does anyone have tips for organizing thoughts and creating compelling arguments in academic writing?',
      topic: 'Literature',
      upvotes: 29, 
      downvotes: 1,
      replies: 15, 
      author: 'essaywriter',
      createdAt: '2025-04-17T16:20:00Z'
    },
    { 
      id: 5, 
      title: 'Help with organic chemistry nomenclature', 
      content: 'I\'m confused about naming organic compounds, especially when there are multiple functional groups. Can someone explain the priority rules and provide some examples?',
      topic: 'Chemistry',
      upvotes: 22, 
      downvotes: 0,
      replies: 4, 
      author: 'chemstudent',
      createdAt: '2025-04-18T08:10:00Z'
    },
  ];

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

        {/* Tickets Wall */}
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer">
                <div className="px-4 py-5 sm:px-6">
                  {/* Header with author and topic */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full mr-2 cursor-pointer hover:opacity-80"
                        src={`https://ui-avatars.com/api/?name=${ticket.author}&background=random`}
                        alt={`${ticket.author}'s avatar`}
                        onClick={(e) => {
                          e.preventDefault();
                          // In a real app, navigate to user profile
                          console.log('Navigate to user profile:', ticket.author);
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700">{ticket.author}</span>
                    </div>
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                      onClick={(e) => {
                        e.preventDefault();
                        // In a real app, filter by topic
                        console.log('Filter by topic:', ticket.topic);
                      }}
                    >
                      {ticket.topic}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                    {ticket.title}
                  </h3>
                  
                  {/* Content */}
                  <p className="text-sm text-gray-500 mb-4">
                    {ticket.content}
                  </p>
                  
                  {/* Footer with stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div 
                      className="flex items-center cursor-pointer hover:text-gray-700"
                      onClick={(e) => {
                        e.preventDefault();
                        // In a real app, navigate to replies section
                        console.log('Navigate to replies section');
                      }}
                    >
                      <svg className="h-5 w-5 mr-1 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      <span>{ticket.replies} replies</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div 
                        className="flex items-center cursor-pointer hover:text-gray-900 group"
                        onClick={(e) => {
                          e.preventDefault();
                          // In a real app, upvote the ticket
                          console.log('Upvote ticket:', ticket.id);
                        }}
                      >
                        <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="font-medium">{ticket.upvotes}</span>
                      </div>
                      
                      <div 
                        className="flex items-center cursor-pointer hover:text-gray-900 group"
                        onClick={(e) => {
                          e.preventDefault();
                          // In a real app, downvote the ticket
                          console.log('Downvote ticket:', ticket.id);
                        }}
                      >
                        <svg className="h-5 w-5 mr-1 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        <span className="font-medium">{ticket.downvotes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Create Ticket Modal */}
      <CreateTicketModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
