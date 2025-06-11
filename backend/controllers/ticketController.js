const Ticket = require('../models/Ticket');
const Vote = require('../models/Vote');

const ticketController = {
  // Get all tickets
  getAllTickets: async (req, res) => {
    try {
      const tickets = await Ticket.getAll();
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a specific ticket by ID
  getTicketById: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const ticket = await Ticket.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create a new ticket
  createTicket: async (req, res) => {
    try {
      const { title, body, topicId } = req.body;
      const authorId = req.user.id;
      const imageBuffer = req.file ? req.file.buffer : null;
      
      if (!title || !body || !topicId) {
        return res.status(400).json({ error: 'Title, body, and topic are required' });
      }
      
      const ticketId = await Ticket.create(title, body, topicId, authorId, imageBuffer);
      res.status(201).json({ id: ticketId, message: 'Ticket created successfully' });
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update an existing ticket
  updateTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const { title, body } = req.body;
      const imageBuffer = req.file ? req.file.buffer : null;
      
      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
      }
      
      const ticket = await Ticket.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      // Check if user is the author of the ticket
      if (ticket.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this ticket' });
      }
      
      await Ticket.update(ticketId, title, body, imageBuffer);
      res.json({ message: 'Ticket updated successfully' });
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a ticket
  deleteTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const ticket = await Ticket.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      // Check if user is the author of the ticket
      if (ticket.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this ticket' });
      }
      
      await Ticket.delete(ticketId);
      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user's votes for all tickets
  getUserVotes: async (req, res) => {
    try {
      const userId = req.user.id;
      const votes = await Vote.getUserVotesForTickets(userId);
      res.json(votes);
    } catch (error) {
      console.error('Error fetching user votes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Upvote a ticket
  upvoteTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const userId = req.user.id;
      
      const result = await Vote.addTicketVote(userId, ticketId, 'upvote');
      res.json(result);
    } catch (error) {
      console.error('Error upvoting ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove upvote from a ticket
  removeUpvoteTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const userId = req.user.id;
      
      const result = await Vote.removeTicketVote(userId, ticketId);
      res.json(result);
    } catch (error) {
      console.error('Error removing upvote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Downvote a ticket
  downvoteTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const userId = req.user.id;
      
      const result = await Vote.addTicketVote(userId, ticketId, 'downvote');
      res.json(result);
    } catch (error) {
      console.error('Error downvoting ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove downvote from a ticket
  removeDownvoteTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const userId = req.user.id;
      
      const result = await Vote.removeTicketVote(userId, ticketId);
      res.json(result);
    } catch (error) {
      console.error('Error removing downvote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all tickets by user ID
  getUserTickets: async (req, res) => {
    try {
      console.log('User object in request:', req.user);
      const userId = req.user?.id;
      
      // Also check query parameter as a backup (for debugging)
      const queryUserId = req.query.uid;
      console.log('User ID from session:', userId, 'Type:', typeof userId);
      console.log('User ID from query:', queryUserId, 'Type:', typeof queryUserId);
      
      // Use either source for the ID
      const finalUserId = userId || queryUserId;
      
      // Get a sample of tickets to check if any exist
      const pool = require('../config/database');
      const [allTickets] = await pool.query('SELECT id, author_id FROM tickets LIMIT 10');
      console.log('Sample of tickets in DB:', allTickets);
      
      const tickets = await Ticket.getAllByUserId(finalUserId);
      console.log('Tickets returned for user:', tickets.length);
      
      res.json({
        userId: finalUserId,
        tickets
      });
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all favorite tickets by user ID
  getUserFavorites: async (req, res) => {
    try {
      const userId = req.user.id;
      const tickets = await Ticket.getAllFavoritesByUserId(userId);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Add a ticket to favorites
  addToFavorites: async (req, res) => {
    try {
      const userId = req.user.id;
      const ticketId = req.params.id;
      await Ticket.addToFavorites(userId, ticketId);
      res.json({ message: 'Ticket added to favorites successfully' });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove a ticket from favorites
  removeFromFavorites: async (req, res) => {
    try {
      const userId = req.user.id;
      const ticketId = req.params.id;
      await Ticket.removeFromFavorites(userId, ticketId);
      res.json({ message: 'Ticket removed from favorites successfully' });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  // Search tickets and topics by query string
  searchTickets: async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const results = await Ticket.searchByTitle(query);
      res.json(results);
    } catch (error) {
      console.error('Error searching tickets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = ticketController;
