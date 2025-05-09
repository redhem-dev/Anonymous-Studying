const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { isLoggedIn } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Public routes
router.get('/', ticketController.getAllTickets);
router.get('/search', ticketController.searchTickets);
router.get('/:id', ticketController.getTicketById);

// Protected routes - require authentication
router.post('/', isLoggedIn, upload.single('image'), ticketController.createTicket);
router.put('/:id', isLoggedIn, upload.single('image'), ticketController.updateTicket);
router.delete('/:id', isLoggedIn, ticketController.deleteTicket);

// Voting routes
router.post('/:id/upvote', isLoggedIn, ticketController.upvoteTicket);
router.delete('/:id/upvote', isLoggedIn, ticketController.removeUpvoteTicket);
router.post('/:id/downvote', isLoggedIn, ticketController.downvoteTicket);
router.delete('/:id/downvote', isLoggedIn, ticketController.removeDownvoteTicket);

// Favorites routes
router.get('/user/tickets', isLoggedIn, ticketController.getUserTickets);
router.get('/user/favorites', isLoggedIn, ticketController.getUserFavorites);
router.post('/:id/favorite', isLoggedIn, ticketController.addToFavorites);
router.delete('/:id/favorite', isLoggedIn, ticketController.removeFromFavorites);

module.exports = router;
