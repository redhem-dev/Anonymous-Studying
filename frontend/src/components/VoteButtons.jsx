import React from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { buildApiUrl } from '../config/apiConfig';

/**
 * VoteButtons component for handling upvote/downvote functionality
 * @param {string|object} itemId - For tickets: string ID, for replies: object {ticketId, replyId}
 * @param {string} itemType - 'ticket' or 'reply'
 * @param {number} upvotes - Current upvote count
 * @param {number} downvotes - Current downvote count
 * @param {string|null} userVote - Current user's vote: 'upvote', 'downvote', or null
 * @param {Function} onVoteChange - Callback for vote changes with signature (newVoteType, prevVoteType) => void
 * @param {string} className - Additional CSS classes
 */
const VoteButtons = ({ 
  itemId, 
  itemType, 
  upvotes = 0, 
  downvotes = 0,
  userVote = null, // 'upvote', 'downvote', or null
  onVoteChange,
  className = ''
}) => {
  const { isAuthenticated } = useAuth();
  
  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      return;
    }
    
    try {
      // Store previous vote type to send to parent callback
      const prevVoteType = userVote;
      
      // Determine the endpoint based on item type
      let apiEndpoint;
      if (itemType === 'ticket') {
        apiEndpoint = buildApiUrl(`/api/tickets/${itemId}/${voteType}`);
      } else {
        // For replies, we need both ticketId and replyId in the URL
        apiEndpoint = buildApiUrl(`/api/tickets/${itemId.ticketId}/replies/${itemId.replyId}/${voteType}`);
      }
      
      // If user clicked the same vote type they already selected, they want to remove it
      const isRemovingVote = userVote === voteType;
      
      // Make API call using fetch instead of axios
      if (isRemovingVote) {
        await fetch(apiEndpoint, { 
          method: 'DELETE',
          credentials: 'include'
        });
        // If removing a vote, we set the new vote type to null
        onVoteChange(null, prevVoteType);
      } else {
        await fetch(apiEndpoint, { 
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        // If adding or changing a vote, we set the new vote type to voteType
        onVoteChange(voteType, prevVoteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to register your vote');
    }
  };
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling to parent elements
          handleVote('upvote');
        }}
        className={`p-1 rounded-full ${userVote === 'upvote' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'}`}
        aria-label="Like"
      >
        <HandThumbUpIcon className="h-5 w-5" />
      </button>
      {(upvotes > 0) && <span className="text-gray-700 font-semibold mx-1">{upvotes}</span>}
      
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling to parent elements
          handleVote('downvote');
        }}
        className={`p-1 rounded-full ${userVote === 'downvote' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}
        aria-label="Dislike"
      >
        <HandThumbDownIcon className="h-5 w-5" />
      </button>
      {(downvotes > 0) && <span className="text-gray-700 font-semibold mx-1">{downvotes}</span>}
    </div>
  );
};

export default VoteButtons;
