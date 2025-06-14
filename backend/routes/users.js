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

// Get user profile by username for the hover popup
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const User = require('../models/User');
    const userProfile = await User.getProfileForPopup(username);
    
    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by username (original endpoint)
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
