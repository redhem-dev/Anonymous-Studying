const pool = require('../config/database');
const User = require('./User');

class Notification {
  
  // Get all notifications for a user
  static async getForUser(userId, limit = 9) {
    try {
      
      // Get user's notifications_last_checked and last_login time
      const [user] = await pool.query(
        'SELECT notifications_last_checked, last_login FROM users WHERE id = ?',
        [userId]
      );
      
      if (!user || user.length === 0) {
        // User not found
        return [];
      }
      
      // Use notifications_last_checked if available, otherwise fall back to last_login
      const lastChecked = user[0].notifications_last_checked;
      const lastLogin = user[0].last_login;
      
      // Use a default date if both are null (1 month ago)
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() - 1);
      const effectiveLastLogin = lastChecked || lastLogin || defaultDate.toISOString();
      
      
      // Get notifications based on replies to the user's tickets
      
      // Get notifications based on replies since last login with explicit date filtering
      const [notifications] = await pool.query(`
        SELECT 
          r.id as reply_id,
          r.ticket_id,
          r.author_id as reply_author_id,
          r.body as reply_content,
          r.created_at as reply_time,
          t.title as ticket_title,
          u.username as reply_author_name
        FROM 
          replies r
        INNER JOIN 
          tickets t ON r.ticket_id = t.id
        INNER JOIN
          users u ON r.author_id = u.id
        WHERE 
          t.author_id = ? 
          AND r.author_id != ?
          AND r.created_at > ?
        ORDER BY 
          r.created_at DESC
        LIMIT ?
      `, [userId, userId, effectiveLastLogin, limit]);
      
      
      // Map notifications to a cleaner format for the frontend
      const formattedNotifications = notifications.map(notification => ({
        id: notification.reply_id,
        type: 'reply',
        ticketId: notification.ticket_id,
        ticketTitle: notification.ticket_title,
        user: notification.reply_author_name,
        content: notification.reply_content.substring(0, 50) + (notification.reply_content.length > 50 ? '...' : ''),
        time: notification.reply_time,
        read: false
      }));
      
      return formattedNotifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Get notification count for a user
  static async getCount(userId) {
    try {
      
      const [user] = await pool.query(
        'SELECT notifications_last_checked, last_login FROM users WHERE id = ?',
        [userId]
      );
      
      if (!user || user.length === 0) {
        // User not found
        return 0;
      }
      
      // Use notifications_last_checked if available, otherwise fall back to last_login
      const lastChecked = user[0].notifications_last_checked;
      const lastLogin = user[0].last_login;
      
      // Use a default date if both are null (1 month ago)
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() - 1);
      const effectiveLastLogin = lastChecked || lastLogin || defaultDate.toISOString();
      
      // Count notifications based on replies for the user's tickets
      const [result] = await pool.query(`
        SELECT COUNT(*) as count
        FROM 
          replies r
        INNER JOIN 
          tickets t ON r.ticket_id = t.id
        WHERE 
          t.author_id = ? 
          AND r.author_id != ?
          AND r.created_at > ?
      `, [userId, userId, effectiveLastLogin]);
      
      const count = result[0].count;
      // Count retrieved successfully
      return count;
    } catch (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }
  }
  
  // Mark all notifications as read by updating notifications_last_checked
  static async markAllAsRead(userId) {
    try {
      // Update the user's notifications_last_checked time to current timestamp
      const success = await User.updateNotificationsLastChecked(userId);
      return success;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return false;
    }
  }
}

module.exports = Notification;
