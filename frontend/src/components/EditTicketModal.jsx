import React, { useState, useEffect } from 'react';
import useTopics from '../hooks/useTopics';

const EditTicketModal = ({ isOpen, onClose, ticket, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    topic_id: '',
    tags: []
  });
  const { topics, isLoading: topicsLoading } = useTopics();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form data when ticket or modal changes
  useEffect(() => {
    if (isOpen && ticket) {
      // Reset form with ticket data
      setFormData({
        title: ticket.title || '',
        body: ticket.body || '',
        topic_id: ticket.topic_id || '',
        tags: ticket.tags || []
      });
    }
  }, [isOpen, ticket]);



  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      // Call the onSave function passed as prop
      const result = await onSave(ticket.id, formData);
      
      if (result) {
        setSuccess(true);
        
        // Close modal after brief success message
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
      setError('Failed to update ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto" style={{ zIndex: 100 }}>
      {/* Backdrop with blur effect */}
      <div className="fixed inset-x-0 top-16 bottom-0 bg-gray-100 bg-opacity-15 backdrop-filter backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 relative">
        {/* Modal panel with rounded corners and thicker border */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-2 border-gray-600 rounded-xl">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Edit Ticket
                </h3>
                
                {/* Success message */}
                {success && (
                  <div className="mb-4 bg-green-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Ticket updated successfully!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error message */}
                {error && (
                  <div className="mb-4 bg-red-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Edit form */}
                <form onSubmit={handleSubmit}>
                  {/* Title field */}
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 my-2 p-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                    />
                  </div>
                  
                  {/* Body/Content field */}
                  <div className="mb-4">
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1 my-2 p-2">
                      Content *
                    </label>
                    <textarea
                      name="body"
                      id="body"
                      rows="5"
                      value={formData.body}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                    ></textarea>
                  </div>
                  
                  {/* Topic selection */}
                  <div className="mb-4">
                    <label htmlFor="topic_id" className="block text-sm font-medium text-gray-700 mb-1 my-2 p-2">
                      Topic *
                    </label>
                    <select
                      name="topic_id"
                      id="topic_id"
                      value={formData.topic_id}
                      onChange={handleChange}
                      required
                      disabled={topicsLoading}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                    >
                      <option value="">{topicsLoading ? 'Loading topics...' : 'Select a topic'}</option>
                      {topics && topics.length > 0 ? (
                        topics.map(topic => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name}
                          </option>
                        ))
                      ) : !topicsLoading && (
                        <option value="" disabled>No topics available</option>
                      )}
                    </select>
                    {topicsLoading && (
                      <p className="mt-1 text-xs text-blue-500">Loading topics...</p>
                    )}
                  </div>
                  
                  {/* Tags field */}
                  <div className="mb-6">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1 my-2 p-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={(e) => {
                        const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                        setFormData(prev => ({ ...prev, tags: tagsArray }));
                      }}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                      placeholder="e.g. math, homework, algebra"
                    />
                  </div>
                  
                  {/* Form actions */}
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        isLoading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTicketModal;
