const pool = require('../config/database');

const favoriteController = {
  // Add a ticket to user's favorites
  addFavorite: async (req, res) => {
    const { ticketId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }
    
    try {
      // Check if ticket exists
      const [tickets] = await pool.query('SELECT id FROM tickets WHERE id = ?', [ticketId]);
      if (tickets.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      // Check if already favorited to prevent duplicates
      const [existing] = await pool.query(
        'SELECT id FROM favorites WHERE user_id = ? AND ticket_id = ?', 
        [userId, ticketId]
      );
      
      if (existing.length > 0) {
        return res.status(200).json({ message: 'Ticket already in favorites', isFavorite: true });
      }
      
      // Add to favorites
      await pool.query(
        'INSERT INTO favorites (user_id, ticket_id, created_at) VALUES (?, ?, NOW())',
        [userId, ticketId]
      );
      
      res.status(201).json({ success: true, message: 'Added to favorites' });
    } catch (err) {
      console.error('Error adding favorite:', err);
      res.status(500).json({ error: 'Failed to add favorite' });
    }
  },
  
  // Remove a ticket from user's favorites
  removeFavorite: async (req, res) => {
    const { ticketId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }
    
    try {
      await pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND ticket_id = ?',
        [userId, ticketId]
      );
      
      res.status(200).json({ success: true, message: 'Removed from favorites' });
    } catch (err) {
      console.error('Error removing favorite:', err);
      res.status(500).json({ error: 'Failed to remove favorite' });
    }
  },
  
  // Check if a ticket is in user's favorites
  checkFavorite: async (req, res) => {
    const { ticketId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      const [favorites] = await pool.query(
        'SELECT id FROM favorites WHERE user_id = ? AND ticket_id = ?',
        [userId, ticketId]
      );
      
      const isFavorite = favorites.length > 0;
      res.status(200).json({ isFavorite });
    } catch (err) {
      console.error('Error checking favorite status:', err);
      res.status(500).json({ error: 'Failed to check favorite status' });
    }
  },
  
  // Get all favorites for a user
  getUserFavorites: async (req, res) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      // Get all favorited tickets with basic ticket info and topic name
      const [favorites] = await pool.query(
        `SELECT 
          t.id, t.title, t.body, t.created_at, t.status, t.upvotes, t.downvotes,
          u.username as author_username,
          tp.name as topic_name,
          f.created_at as favorited_at
        FROM favorites f
        JOIN tickets t ON f.ticket_id = t.id
        JOIN users u ON t.author_id = u.id
        JOIN topics tp ON t.topic_id = tp.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC`,
        [userId]
      );
      
      res.status(200).json(favorites);
    } catch (err) {
      console.error('Error getting user favorites:', err);
      res.status(500).json({ error: 'Failed to get favorites' });
    }
  }
};

module.exports = favoriteController;
