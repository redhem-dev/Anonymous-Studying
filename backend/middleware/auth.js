/**
 * Authentication middleware functions
 */

// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

module.exports = {
  isLoggedIn
};
