const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to initiate Google OAuth authentication
router.get('/google', authController.googleAuth);

// Google OAuth callback route - this should be mounted at /google/callback in app.js
router.get('/callback', authController.googleCallback);

// Route to check authentication status
router.get('/status', authController.getStatus);

// Logout route
router.get('/logout', authController.logout);

// Update username route
router.post('/update-username', authController.updateUsername);

module.exports = router;
