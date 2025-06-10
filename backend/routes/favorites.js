const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// All favorite routes require authentication
router.use(isAuthenticated);

// Add a ticket to favorites
router.post('/add', favoriteController.addFavorite);

// Remove a ticket from favorites
router.post('/remove', favoriteController.removeFavorite);

// Check if a ticket is in user's favorites
router.get('/check/:ticketId', favoriteController.checkFavorite);

// Get all user's favorites
router.get('/', favoriteController.getUserFavorites);

module.exports = router;
