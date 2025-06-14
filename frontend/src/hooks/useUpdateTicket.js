import { useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/apiConfig';

/**
 * Hook for updating existing tickets
 * @returns {Object} Update ticket functionality and state
 */
const useUpdateTicket = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Update an existing ticket
   * @param {string|number} ticketId - ID of the ticket to update
   * @param {Object} ticketData - Updated ticket data (title, body, topic_id, tags)
   * @returns {Promise<Object>} Updated ticket data
   */
  const updateTicket = async (ticketId, ticketData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Format tags if they exist and are a string
      const formattedData = { ...ticketData };
      if (typeof formattedData.tags === 'string') {
        formattedData.tags = formattedData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }

      const response = await axios({
        method: 'PUT',
        url: buildApiUrl(`/api/tickets/${ticketId}`),
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include cookies for authentication
        data: {
          title: formattedData.title,
          body: formattedData.body || formattedData.content,
          topicId: formattedData.topic_id,
          tags: formattedData.tags || []
        }
      });

      setSuccess(true);
      return response.data;
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update ticket. Please try again later.');
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
    updateTicket,
    isLoading,
    error,
    success,
    resetState
  };
};

export default useUpdateTicket;
