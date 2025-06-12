import React, { useState, useEffect } from 'react';
import useCreateTicket from '../hooks/useCreateTicket';
import useTickets from '../hooks/useTickets';
import useTopics from '../hooks/useTopics';

const CreateTicketModal = ({ isOpen, onClose }) => {
  // Fetch topics from the API using our custom hook
  const { topics, isLoading: topicsLoading } = useTopics();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [tags, setTags] = useState('');

  // Use the ticket creation hook
  const { createTicket, isLoading, error, success, resetState } = useCreateTicket();
  
  // Use the tickets hook to refresh tickets after creation
  const { refreshTickets } = useTickets();
  
  // Reset success and error states when modal is opened/closed
  useEffect(() => {
    resetState();
  }, [isOpen, resetState]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createTicket({
        title,
        content,
        topicId: selectedTopic,
        tags
      });
      
      // Refresh the tickets list to include the new ticket
      await refreshTickets();
      
      // On successful creation, reset form and close modal after a short delay to show success message
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
      
    } catch (err) {
      // Error is handled by the hook and displayed in the UI
      console.error('Error in form submission:', err);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTopic('');
    setTags('');
  };

  // Close modal and reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay with blur effect */}
      <div 
        className="fixed inset-0 bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>
      
      {/* Modal panel */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Create New Ticket
                </h3>
                
                {/* Success message */}
                {success && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">Ticket created successfully!</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="mt-2">
                  {/* Title field */}
                  <div className="mb-3">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="Enter a descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Content field */}
                  <div className="mb-3">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Content
                    </label>
                    <textarea
                      id="content"
                      rows="4"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="Describe your question or problem"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  {/* Topic dropdown */}
                  <div className="mb-3">
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Topic
                    </label>
                    <select
                      id="topic"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      required
                      disabled={topicsLoading}
                    >
                      <option value="" disabled>{topicsLoading ? 'Loading topics...' : 'Select a topic'}</option>
                      {topics && topics.length > 0 ? (
                        topics.map((topic) => (
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
                  <div className="mb-3">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="e.g., calculus, algebra, equations"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500 text-left">
                      Separate multiple tags with commas.
                    </p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 mt-4 -mx-4 -mb-4">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 sm:ml-3 sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : "Create Ticket"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={handleClose}
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

export default CreateTicketModal;
