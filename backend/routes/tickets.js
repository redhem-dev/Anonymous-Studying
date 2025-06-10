const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const replyController = require('../controllers/replyController');
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

// Reply routes
router.get('/:ticketId/replies', replyController.getAllReplies);
router.post('/:ticketId/replies', isLoggedIn, upload.single('image'), replyController.createReply);
router.put('/:ticketId/replies/:replyId', isLoggedIn, upload.single('image'), replyController.updateReply);
router.delete('/:ticketId/replies/:replyId', isLoggedIn, replyController.deleteReply);

// Reply voting routes
router.post('/:ticketId/replies/:replyId/upvote', isLoggedIn, replyController.upvoteReply);
router.delete('/:ticketId/replies/:replyId/upvote', isLoggedIn, replyController.removeUpvoteReply);
router.post('/:ticketId/replies/:replyId/downvote', isLoggedIn, replyController.downvoteReply);
router.delete('/:ticketId/replies/:replyId/downvote', isLoggedIn, replyController.removeDownvoteReply);

module.exports = router;
