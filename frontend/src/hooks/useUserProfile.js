import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { buildApiUrl } from '../config/apiConfig';

/**
 * Custom hook for user profile data
 * @returns {Object} User profile data and functions
 */
const useUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [userTickets, setUserTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's tickets
  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!isAuthenticated || !user) return;
      
      // Store user ID in localStorage for other components to use
      if (user.id) {
        localStorage.setItem('userId', user.id);
      }
      
      try {
        setIsLoading(true);
        // Get userId from either context or localStorage
        const userId = user?.id || localStorage.getItem('userId');
        
        // Use the EXACT path as defined in your routes file
        const response = await fetch(buildApiUrl(`/api/tickets/user/tickets?uid=${userId}`), {
          credentials: 'include', // Important for cookies/session
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure reply_count is properly formatted for each ticket
        const formattedTickets = (data.tickets || []).map(ticket => ({
          ...ticket,
          reply_count: typeof ticket.reply_count === 'number' ? ticket.reply_count : parseInt(ticket.reply_count || 0)
        }));
        
        setUserTickets(formattedTickets);
      } catch (err) {
        console.error('Failed to fetch user tickets:', err);
        setError('Failed to load your tickets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTickets();
  }, [isAuthenticated, user]);

  /**
   * Delete a ticket
   * @param {Number} ticketId - ID of the ticket to delete
   * @returns {Promise<boolean>} Success status
   */
  const deleteTicket = async (ticketId) => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(`/api/tickets/${ticketId}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Update local state to remove the deleted ticket
      setUserTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      
      return true;
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      setError('Failed to delete ticket. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Edit a ticket
   * @param {Number} ticketId - ID of the ticket to edit
   * @param {Object} ticketData - Updated ticket data
   * @returns {Promise<boolean>} Success status
   */
  const editTicket = async (ticketId, ticketData) => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(`/api/tickets/${ticketId}`), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const updatedTicket = await response.json();
      
      // Update local state with the edited ticket
      setUserTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
        )
      );
      
      return true;
    } catch (err) {
      console.error('Failed to edit ticket:', err);
      setError('Failed to update ticket. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userTickets,
    isLoading,
    error,
    deleteTicket,
    editTicket
  };
};

export default useUserProfile;
