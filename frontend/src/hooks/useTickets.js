import { useState, useEffect } from 'react';
import { buildApiUrl } from '../config/apiConfig';

/**
 * Custom hook to fetch all tickets and provide search functionality
 * @returns {Object} Tickets data and related functions
 */
export const useTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState({ tickets: [], topics: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(buildApiUrl('/api/tickets'), {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setTickets(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Search tickets and topics
  const searchTickets = async (query) => {
    if (!query.trim()) {
      setSearchResults({ tickets: [], topics: [] });
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(buildApiUrl(`/api/tickets/search?query=${encodeURIComponent(query)}`), {
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setIsSearching(false);
      
      const data = await response.json();
      setSearchResults(data);
      setError(null);
    
    } catch (err) {
      console.error('Error searching tickets:', err);
      setError('Failed to search. Please try again later.');
      setSearchResults({ tickets: [], topics: [] });
    }
  };

  // Function to manually refresh tickets
  const refreshTickets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('/api/tickets'), {
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTickets(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing tickets:', err);
      setError('Failed to refresh tickets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tickets,
    isLoading,
    error,
    searchTickets,
    searchResults,
    isSearching,
    refreshTickets
  };
};

export default useTickets;
