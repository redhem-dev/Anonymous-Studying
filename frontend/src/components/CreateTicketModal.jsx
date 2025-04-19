import React, { useState } from 'react';

const CreateTicketModal = ({ isOpen, onClose }) => {
  // Example topics for the dropdown
  const topics = [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Computer Science' },
    { id: 3, name: 'Physics' },
    { id: 4, name: 'Chemistry' },
    { id: 5, name: 'Literature' },
    { id: 6, name: 'History' },
    { id: 7, name: 'Biology' },
  ];

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [tags, setTags] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    console.log({
      title,
      content,
      topic: selectedTopic,
      tags: tags.split(',').map(tag => tag.trim())
    });
    
    // Reset form and close modal
    resetForm();
    onClose();
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
                    >
                      <option value="" disabled>Select a topic</option>
                      {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
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
                      className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 sm:ml-3 sm:w-auto"
                    >
                      Create Ticket
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
