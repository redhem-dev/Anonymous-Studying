const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');

// Get currently logged in user
router.get('/current', isAuthenticated, (req, res) => {
  // Return the user object from session without sensitive info
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { password, ...user } = req.user;
  res.json(user);
});

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    // This would typically query the database
    // For now, we'll just return a basic profile without querying
    res.json({
      username: req.params.username,
      joinDate: new Date(),
      ticketCount: 0,
      replyCount: 0
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
