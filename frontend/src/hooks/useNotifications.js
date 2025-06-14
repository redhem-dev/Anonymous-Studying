import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/apiConfig';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Removed logging function

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(buildApiUrl('/api/notifications'), {
        withCredentials: true
      });
      
      const notificationData = response.data.notifications || [];
      setNotifications(notificationData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    try {
      
      const response = await axios.get(buildApiUrl('/api/notifications/count'), {
        withCredentials: true
      });
      
      const count = response.data.count || 0;
      setNotificationCount(count);

    } catch (err) {
      console.error('Error fetching notification count:', err);
      // Don't update the state on error to avoid losing previous valid count
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      
      await axios.post(buildApiUrl('/api/notifications/mark-read'), {}, {
        withCredentials: true
      });
      
      setNotificationCount(0);
      
      // Refresh the notifications list
      await fetchNotifications();
      
      // Also refresh the count after a brief delay to ensure backend has updated
      setTimeout(() => {
        fetchNotificationCount();
      }, 1000);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      setError('Failed to mark notifications as read');
    }
  }, [fetchNotifications, fetchNotificationCount]);

  // Initial fetch and setup polling
  useEffect(() => {
    
    // Initial fetch
    fetchNotifications();
    fetchNotificationCount();
    
    // Set up polling for notification count (every 30 seconds)
    const intervalId = setInterval(() => {

      fetchNotificationCount();
    }, 30000); // Reduced from 60s to 30s for more timely updates
    
    return () => {

      clearInterval(intervalId);
    };
  }, [fetchNotifications, fetchNotificationCount]);

  return {
    notifications,
    notificationCount,
    loading,
    error,
    fetchNotifications,
    fetchNotificationCount,
    markAllAsRead
  };
};

export default useNotifications;
