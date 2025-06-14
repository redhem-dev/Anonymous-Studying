const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();
require('./config/auth');

// Import routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const favoriteRoutes = require('./routes/favorites');
const topicRoutes = require('./routes/topics');
const notificationRoutes = require('./routes/notifications');

// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Your frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'cache-control', 'pragma', 'Accept'],
    exposedHeaders: ['Set-Cookie']
}));

// Add additional headers for cookies
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json());

// Enable trust proxy - CRITICAL for secure cookies behind a proxy
app.set('trust proxy', 1);

// Session configuration
app.use(session({ 
    secret: process.env.SESSION_SECRET, 
    resave: true, // Changed to true to ensure session is saved on each request
    saveUninitialized: true, // Ensure session is always initialized
    name: 'study_session', // Custom name to avoid conflicts
    cookie: {
        secure: true, // Must be true for cross-domain in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'none', // Required for cross-domain cookies
        path: '/' // Explicit path setting
    },
    proxy: true, // Trust the reverse proxy for secure cookies
    unset: 'destroy' // Ensure complete removal on req.session.destroy()
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Home route
app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>');
});

// Mount auth routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes); // Also mount under /api for frontend API calls

// Special route for Google callback - this must match exactly what's registered in Google Cloud Console
app.get('/google/callback', passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : 'http://localhost:5173/login',
    session: true
}), (req, res) => {
    // Successful authentication, redirect to frontend callback route
    res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/auth/callback` : 'http://localhost:5173/auth/callback');
});

// Protected route example
app.get('/protected', isLoggedIn, (req, res) => {
    res.json({
        message: "You're authenticated!",
        user: {
            id: req.user.id,
            username: req.user.username
        }
    });
});

// API routes for tickets, replies, etc.
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/replies', replyRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});