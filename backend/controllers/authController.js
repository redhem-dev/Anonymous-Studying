const passport = require('passport');
const User = require('../models/User');

// Controller for authentication-related operations
const authController = {
  // Check authentication status
  getStatus: (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        isAuthenticated: true, 
        user: {
          id: req.user.id,
          username: req.user.username
        }
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  },

  // Handle logout
  logout: (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error logging out' });
      }
      res.redirect('http://localhost:5173/login');
    });
  },

  // Google authentication
  googleAuth: passport.authenticate('google', { 
    scope: ['email', 'profile'] 
  }),

  // Google callback
  googleCallback: [
    passport.authenticate('google', { 
      failureRedirect: 'http://localhost:5173/login',
      session: true
    }),
    (req, res) => {
      // Successful authentication, redirect to frontend callback route
      res.redirect('http://localhost:5173/auth/callback');
    }
  ],

  // Update username
  updateUsername: async (req, res) => {
    try {
      const { newUsername } = req.body;
      const userId = req.user.id;
      
      if (!newUsername) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      await User.changeUsername(userId, newUsername);
      res.json({ success: true, message: 'Username updated successfully' });
    } catch (error) {
      console.error('Error updating username:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = authController;
