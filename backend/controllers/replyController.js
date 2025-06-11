const Reply = require('../models/Reply');
const Ticket = require('../models/Ticket');
const Vote = require('../models/Vote');

const replyController = {
  // Get all replies for a ticket
  getAllReplies: async (req, res) => {
    try {
      const ticketId = req.params.ticketId;
      const replies = await Reply.getAllByTicketId(ticketId);
      res.json(replies);
    } catch (error) {
      console.error('Error fetching replies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create a new reply
  createReply: async (req, res) => {
    try {
      const ticketId = req.params.ticketId;
      const { body } = req.body;
      const authorId = req.user.id;
      const imageBuffer = req.file ? req.file.buffer : null;
      
      if (!body) {
        return res.status(400).json({ error: 'Reply body is required' });
      }
      
      // Check if ticket exists
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      const replyId = await Reply.create(ticketId, authorId, body, imageBuffer);
      res.status(201).json({ id: replyId, message: 'Reply created successfully' });
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update an existing reply
  updateReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      const { body } = req.body;
      const imageBuffer = req.file ? req.file.buffer : null;
      
      if (!body) {
        return res.status(400).json({ error: 'Reply body is required' });
      }
      
      const reply = await Reply.findById(replyId);
      
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }
      
      // Check if user is the author of the reply
      if (reply.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this reply' });
      }
      
      await Reply.update(replyId, body, imageBuffer);
      res.json({ message: 'Reply updated successfully' });
    } catch (error) {
      console.error('Error updating reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a reply
  deleteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      const reply = await Reply.findById(replyId);
      
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }
      
      // Check if user is the author of the reply
      if (reply.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this reply' });
      }
      
      await Reply.delete(replyId);
      res.json({ message: 'Reply deleted successfully' });
    } catch (error) {
      console.error('Error deleting reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user's votes for replies
  getUserReplyVotes: async (req, res) => {
    try {
      const userId = req.user.id;
      const votes = await Vote.getUserVotesForReplies(userId);
      res.json(votes);
    } catch (error) {
      console.error('Error fetching user reply votes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Upvote a reply
  upvoteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      const userId = req.user.id;
      
      const result = await Vote.addReplyVote(userId, replyId, 'upvote');
      res.json(result);
    } catch (error) {
      console.error('Error upvoting reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove upvote from a reply
  removeUpvoteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      const userId = req.user.id;
      
      const result = await Vote.removeReplyVote(userId, replyId);
      res.json(result);
    } catch (error) {
      console.error('Error removing upvote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Downvote a reply
  downvoteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      const userId = req.user.id;
      
      const result = await Vote.addReplyVote(userId, replyId, 'downvote');
      res.json(result);
    } catch (error) {
      console.error('Error downvoting reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove downvote from a reply
  removeDownvoteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      const userId = req.user.id;
      
      const result = await Vote.removeReplyVote(userId, replyId);
      res.json(result);
    } catch (error) {
      console.error('Error removing downvote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mark a reply as the accepted answer for a ticket
  acceptReply: async (req, res) => {
    try {
      const { ticketId, replyId } = req.params;
      const userId = req.user.id;
      
      // First, verify that the user is the owner of the ticket
      const [tickets] = await pool.execute(
        'SELECT * FROM tickets WHERE id = ? AND user_id = ?',
        [ticketId, userId]
      );
      
      if (tickets.length === 0) {
        return res.status(403).json({ error: 'You can only accept answers for your own tickets' });
      }
      
      // Mark the reply as accepted
      await pool.execute(
        'UPDATE replies SET is_accepted = 1 WHERE id = ? AND ticket_id = ?',
        [replyId, ticketId]
      );
      
      // Mark the ticket as resolved
      await pool.execute(
        'UPDATE tickets SET is_resolved = 1 WHERE id = ?',
        [ticketId]
      );
      
      res.json({ success: true, message: 'Reply accepted as answer' });
    } catch (error) {
      console.error('Error accepting reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = replyController;
