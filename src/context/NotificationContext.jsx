import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { useUser } from './UserContext';

const NotificationContext = createContext(null);

const NOTIFICATION_TYPES = {
  MEMBER_JOINED: 'member_joined',
  MEMBER_LEFT: 'member_left',
  MEMBER_STATUS: 'member_status',
  TRAVEL_UPDATE: 'travel_update',
  ITINERARY_ADDED: 'itinerary_added',
  ITINERARY_UPDATED: 'itinerary_updated',
  ITINERARY_DELETED: 'itinerary_deleted',
  EVENT_REMINDER: 'event_reminder',
  TRIP_STARTING: 'trip_starting',
  CHAT_MESSAGE: 'chat_message',
  BIRTHDAY: 'birthday',
  SYSTEM: 'system',
};

const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.MEMBER_JOINED]: 'UserPlus',
  [NOTIFICATION_TYPES.MEMBER_LEFT]: 'UserMinus',
  [NOTIFICATION_TYPES.MEMBER_STATUS]: 'Activity',
  [NOTIFICATION_TYPES.TRAVEL_UPDATE]: 'Plane',
  [NOTIFICATION_TYPES.ITINERARY_ADDED]: 'CalendarPlus',
  [NOTIFICATION_TYPES.ITINERARY_UPDATED]: 'CalendarClock',
  [NOTIFICATION_TYPES.ITINERARY_DELETED]: 'CalendarX',
  [NOTIFICATION_TYPES.EVENT_REMINDER]: 'Bell',
  [NOTIFICATION_TYPES.TRIP_STARTING]: 'MapPin',
  [NOTIFICATION_TYPES.CHAT_MESSAGE]: 'MessageCircle',
  [NOTIFICATION_TYPES.BIRTHDAY]: 'Cake',
  [NOTIFICATION_TYPES.SYSTEM]: 'Info',
};

export function NotificationProvider({ children }) {
  const { userId, preferences } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications on mount
  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const stored = await getItem(STORAGE_KEYS.NOTIFICATIONS, []);
        setNotifications(stored);
        setUnreadCount(stored.filter(n => !n.read).length);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  // Save notifications when they change
  const saveNotifications = useCallback(async (newNotifications) => {
    try {
      await setItem(STORAGE_KEYS.NOTIFICATIONS, newNotifications, { shared: false });
    } catch (err) {
      console.error('Failed to save notifications:', err);
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback(async (notification) => {
    // Check user preferences
    const notifPrefs = preferences?.notifications || {};

    // Map notification types to preference keys
    const prefMap = {
      [NOTIFICATION_TYPES.MEMBER_JOINED]: 'memberChanges',
      [NOTIFICATION_TYPES.MEMBER_LEFT]: 'memberChanges',
      [NOTIFICATION_TYPES.MEMBER_STATUS]: 'statusUpdates',
      [NOTIFICATION_TYPES.TRAVEL_UPDATE]: 'tripUpdates',
      [NOTIFICATION_TYPES.ITINERARY_ADDED]: 'itineraryChanges',
      [NOTIFICATION_TYPES.ITINERARY_UPDATED]: 'itineraryChanges',
      [NOTIFICATION_TYPES.ITINERARY_DELETED]: 'itineraryChanges',
      [NOTIFICATION_TYPES.EVENT_REMINDER]: 'reminders1h',
      [NOTIFICATION_TYPES.TRIP_STARTING]: 'tripUpdates',
      [NOTIFICATION_TYPES.CHAT_MESSAGE]: 'chatMessages',
    };

    const prefKey = prefMap[notification.type];
    if (prefKey && notifPrefs[prefKey] === false) {
      return null; // User has disabled this notification type
    }

    const newNotification = {
      id: generateId(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    setUnreadCount(prev => prev + 1);
    await saveNotifications(updatedNotifications);

    // Show browser notification if supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.svg',
          tag: newNotification.id,
        });
      } catch (err) {
        // Browser notifications may not be available in all contexts
      }
    }

    return newNotification;
  }, [notifications, preferences, saveNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );

    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);

    setNotifications(updatedNotifications);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    await saveNotifications([]);
  }, [saveNotifications]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return 'denied';
  }, []);

  // Helper to create notifications for common events
  const notify = {
    memberJoined: (memberName, groupName) => addNotification({
      type: NOTIFICATION_TYPES.MEMBER_JOINED,
      title: 'New Member',
      message: `${memberName} joined ${groupName}`,
      groupName,
    }),

    memberLeft: (memberName, groupName) => addNotification({
      type: NOTIFICATION_TYPES.MEMBER_LEFT,
      title: 'Member Left',
      message: `${memberName} left ${groupName}`,
      groupName,
    }),

    memberStatus: (memberName, status) => addNotification({
      type: NOTIFICATION_TYPES.MEMBER_STATUS,
      title: 'Status Update',
      message: `${memberName} is now ${status}`,
    }),

    travelUpdate: (memberName, updateType) => addNotification({
      type: NOTIFICATION_TYPES.TRAVEL_UPDATE,
      title: 'Travel Update',
      message: `${memberName} updated their ${updateType}`,
    }),

    eventAdded: (eventTitle, groupName) => addNotification({
      type: NOTIFICATION_TYPES.ITINERARY_ADDED,
      title: 'New Event',
      message: `"${eventTitle}" was added to ${groupName}`,
      groupName,
    }),

    eventUpdated: (eventTitle) => addNotification({
      type: NOTIFICATION_TYPES.ITINERARY_UPDATED,
      title: 'Event Updated',
      message: `"${eventTitle}" was updated`,
    }),

    eventReminder: (eventTitle, timeUntil) => addNotification({
      type: NOTIFICATION_TYPES.EVENT_REMINDER,
      title: 'Upcoming Event',
      message: `"${eventTitle}" starts ${timeUntil}`,
      priority: 'high',
    }),

    tripStarting: (groupName, daysUntil) => addNotification({
      type: NOTIFICATION_TYPES.TRIP_STARTING,
      title: 'Trip Starting Soon',
      message: `${groupName} starts in ${daysUntil} days!`,
      priority: 'high',
    }),

    birthday: (memberName) => addNotification({
      type: NOTIFICATION_TYPES.BIRTHDAY,
      title: 'Birthday!',
      message: `It's ${memberName}'s birthday today!`,
    }),

    system: (title, message) => addNotification({
      type: NOTIFICATION_TYPES.SYSTEM,
      title,
      message,
    }),
  };

  // Get notifications grouped by date
  const getGroupedNotifications = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [],
      yesterday: [],
      older: [],
    };

    notifications.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestPermission,
    notify,
    getGroupedNotifications,
    NOTIFICATION_TYPES,
    NOTIFICATION_ICONS,
    hasUnread: unreadCount > 0,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export { NOTIFICATION_TYPES, NOTIFICATION_ICONS };
export default NotificationContext;
