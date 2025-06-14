import { useState } from 'react';
import { buildApiUrl } from '../config/apiConfig';

/**
 * Hook for creating new tickets
 * @returns {Object} Create ticket functionality and state
 */
const useCreateTicket = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Create a new ticket
   * @param {Object} ticketData - Ticket data (title, body, topicId, tags)
   * @returns {Promise<Object>} Created ticket data
   */
  const createTicket = async (ticketData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Format tags if they exist
      const formattedData = { ...ticketData };
      if (typeof formattedData.tags === 'string') {
        formattedData.tags = formattedData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }

      const response = await fetch(buildApiUrl('/api/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          title: formattedData.title,
          body: formattedData.content || formattedData.body,
          topicId: formattedData.topicId || formattedData.selectedTopic,
          tags: formattedData.tags || []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ticket');
      }

      const result = await response.json();
      setSuccess(true);
      return result;
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err.message || 'Failed to create ticket. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset the form state
   */
  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    createTicket,
    isLoading,
    error,
    success,
    resetState
  };
};

export default useCreateTicket;
