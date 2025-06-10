/**
 * Authentication middleware functions
 */

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user && !req.user.tempUser) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

// Check if user is a moderator
const isModerator = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.is_moderator) {
    return next();
  }
  return res.status(403).json({ error: 'Moderator access required' });
};

module.exports = {
  isAuthenticated,
  isModerator
};
