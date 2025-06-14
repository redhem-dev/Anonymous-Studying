const passport = require('passport');
const User = require('../models/User');

// Controller for authentication-related operations
const authController = {
  // Check authentication status
  getStatus: (req, res) => {
    // Only consider real DB users as authenticated (not temp users)
    if (req.isAuthenticated() && req.user && !req.user.tempUser && req.user.id) {
      res.json({ 
        isAuthenticated: true, 
        user: req.user
      });
    } else if (req.isAuthenticated() && req.user) {
      // Temporary user - needs to complete registration
      res.json({ 
        isAuthenticated: false, 
        tempUser: true,
        email: req.user.email,
        emailHash: req.user.emailHash
      });
    } else {
      // Not authenticated at all
      res.json({ isAuthenticated: false, user: null });
    }
  },

  // Handle logout - guaranteed session termination
  logout: (req, res) => {
    // 1. First manually nullify user in session
    if (req.session) {
      req.session.passport = null;
      req.user = null;
    }
    
    // 2. Use Passport's logout
    req.logout(function(logoutErr) {
      // 3. Force destroy the session regardless of logout errors
      if (req.session) {
        req.session.destroy(function(destroyErr) {
          // 4. Clear the cookie using multiple approaches
          
          // Basic cookie clear
          res.clearCookie('connect.sid');
          
          // With common Express session options
          res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true
          });
          
          // With domain specified
          res.clearCookie('connect.sid', {
            path: '/',
            domain: 'localhost'
          });
          
          // With alternative paths
          ['/', '/api', '/api/auth'].forEach(path => {
            res.clearCookie('connect.sid', { path });
          });
          
          // Set response headers to prevent caching
          res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          });
          
          // 5. Send response with clear instruction to reset state
          return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            clearState: true
          });
        });
      } else {
        // No session exists, still clear cookies and respond
        res.clearCookie('connect.sid', { path: '/' });
        return res.status(200).json({ success: true, noSession: true });
      }
    });
  },

  // Google authentication
  googleAuth: passport.authenticate('google', { 
    scope: ['email', 'profile'] 
  }),

  // Google callback
  googleCallback: [
    passport.authenticate('google', { 
      failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : 'http://localhost:5173/login',
      session: true
    }),
    async (req, res) => {
      try {
        // By this point, req.user should contain the user object passed from Google strategy
        if (!req.user) {
          return res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login?error=no_user` : 'http://localhost:5173/login?error=no_user');
        }
        
        // Make sure the session is saved before redirecting
        req.session.save((err) => {
          if (err) {
            return res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login?error=session_error` : 'http://localhost:5173/login?error=session_error');
          }
          
          // Check if user is a temp user or a real DB user
          if (req.user.tempUser) {
            // New user - needs to set username
            const email = req.user.email || '';
            const encodedEmail = encodeURIComponent(email);
            return res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/set-username?email=${encodedEmail}` : `http://localhost:5173/set-username?email=${encodedEmail}`);
          } else if (req.user.id) {
            // Existing user - go to dashboard
            return res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard` : 'http://localhost:5173/dashboard');
          } else {
            // Something is wrong with the user object
            return res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login?error=invalid_user` : 'http://localhost:5173/login?error=invalid_user');
          }
        });
      } catch (error) {
        res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login?error=callback_error` : 'http://localhost:5173/login?error=callback_error');
      }
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
  },

  // Check if user exists by email (hashed)
  checkUser: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });
      const emailHash = User.hashEmail(email);
      const user = await User.findByEmailHash(emailHash);
      res.json({ exists: !!user });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Check if username exists
  checkUsername: async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) return res.status(400).json({ error: 'Username required' });
      const user = await User.findByUsername(username);
      res.json({ exists: !!user });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Register a new user
  register: async (req, res) => {
    try {
      const { email, username } = req.body;
      
      // Input validation
      if (!email || !username) {
        return res.status(400).json({ error: 'Email and username required' });
      }
      
      // Hash the email for storage
      const emailHash = User.hashEmail(email);
      
      // Step 1: Ensure user doesn't already exist
      const existingUser = await User.findByEmailHash(emailHash);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Step 2: Ensure username is available
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      // Step 3: Create the user
      const userId = await User.create(emailHash, username);
      
      // Step 4: Get the complete user object
      const newUser = await User.findById(userId);
      if (!newUser) {
        return res.status(500).json({ error: 'User creation failed' });
      }
      
      // Step 5: Update the session - this is the critical part!
      await new Promise((resolve, reject) => {
        // Log the user in to create a session
        req.login(newUser, (err) => {
          if (err) return reject(err);
          
          // Force session save to ensure persistence
          req.session.save((err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
      
      // Step 6: Return success with user object for the frontend
      return res.json({ 
        success: true, 
        user: newUser
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

module.exports = authController;
