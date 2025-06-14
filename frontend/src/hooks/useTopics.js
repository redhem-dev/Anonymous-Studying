import { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/apiConfig';

const useTopics = () => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(buildApiUrl('/api/topics'));
      setTopics(response.data);
    } catch (err) {
      setError('Failed to fetch topics');
      console.error('Error fetching topics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return { topics, isLoading, error, fetchTopics };
};

export default useTopics;
