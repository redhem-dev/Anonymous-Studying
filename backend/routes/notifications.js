const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isLoggedIn } = require('../middleware/auth');

// All notification routes should be authenticated
router.use(isLoggedIn);

// Get notifications for the logged-in user
router.get('/', notificationController.getNotifications);

// Get notification count for the logged-in user
router.get('/count', notificationController.getNotificationCount);

// Mark all notifications as read
router.post('/mark-read', notificationController.markAsRead);

module.exports = router;
