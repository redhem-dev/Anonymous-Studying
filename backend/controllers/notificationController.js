const Notification = require('../models/Notification');

const notificationController = {
  // Get notifications for the logged-in user
  getNotifications: async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit) : 9;
      const notifications = await Notification.getForUser(userId, limit);
      
      res.json({ notifications });
    } catch (error) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get notification count for the logged-in user
  getNotificationCount: async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const count = await Notification.getCount(userId);
      
      res.json({ count });
    } catch (error) {
      console.error('Error in getNotificationCount:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mark all notifications as read
  markAsRead: async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const success = await Notification.markAllAsRead(userId);
      
      if (success) {
        res.json({ success: true, message: 'All notifications marked as read' });
      } else {
        res.status(500).json({ error: 'Failed to mark notifications as read' });
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = notificationController;
