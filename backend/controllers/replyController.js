const Reply = require('../models/Reply');
const Ticket = require('../models/Ticket');

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

  // Upvote a reply
  upvoteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      await Reply.increaseUpvote(replyId);
      res.json({ message: 'Reply upvoted successfully' });
    } catch (error) {
      console.error('Error upvoting reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove upvote from a reply
  removeUpvoteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      await Reply.decreaseUpvote(replyId);
      res.json({ message: 'Upvote removed successfully' });
    } catch (error) {
      console.error('Error removing upvote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Downvote a reply
  downvoteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      await Reply.increaseDownvote(replyId);
      res.json({ message: 'Reply downvoted successfully' });
    } catch (error) {
      console.error('Error downvoting reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove downvote from a reply
  removeDownvoteReply: async (req, res) => {
    try {
      const replyId = req.params.replyId;
      await Reply.decreaseDownvote(replyId);
      res.json({ message: 'Downvote removed successfully' });
    } catch (error) {
      console.error('Error removing downvote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = replyController;
