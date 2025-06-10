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
router.post('/logout', authController.logout);

// Update username route
router.post('/update-username', authController.updateUsername);

// New user registration and checking endpoints
router.post('/check-user', authController.checkUser);
router.post('/check-username', authController.checkUsername);
router.post('/register', authController.register);

module.exports = router;
