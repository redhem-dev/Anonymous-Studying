import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import useAuth from '../hooks/useAuth';
import { buildApiUrl } from '../config/apiConfig';

/**
 * A reusable favorite button component
 * @param {Object} props
 * @param {number} props.ticketId - ID of the ticket to favorite/unfavorite
 * @param {string} [props.size="lg"] - Size of the star icon
 * @param {string} [props.className=""] - Additional classes for the button
 * @param {Function} [props.onFavoriteChange] - Callback function when favorite status changes, receives isFavorite boolean
 */
const FavoriteButton = ({ ticketId, size = "lg", className = "", onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Only fetch favorite status if user is authenticated
    if (isAuthenticated && ticketId) {
      checkFavoriteStatus();
    } else {
      setIsLoading(false);
    }
  }, [ticketId, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(`/api/favorites/check/${ticketId}`), {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Prevent event bubbling to parent elements
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      
      const endpoint = isFavorite ? 'remove' : 'add';
      const response = await fetch(buildApiUrl(`/api/favorites/${endpoint}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ticketId }),
      });
      
      if (response.ok) {
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);
        
        // Notify parent component if callback exists
        if (onFavoriteChange) {
          onFavoriteChange(newStatus);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <button 
      className={`transition-colors duration-200 focus:outline-none ${className}`}
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <FontAwesomeIcon 
        icon={isFavorite ? faStarSolid : faStarRegular} 
        className={`${isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'} 
                    ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        size={size}
        bounce={isLoading}
      />
    </button>
  );
};

export default FavoriteButton;
