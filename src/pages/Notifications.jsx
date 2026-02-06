import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  UserPlus,
  UserMinus,
  Activity,
  Plane,
  Calendar,
  CalendarPlus,
  CalendarClock,
  CalendarX,
  Clock,
  MapPin,
  MessageCircle,
  Cake,
  Info,
  Settings,
  Filter,
} from 'lucide-react';
import { useNotifications, NOTIFICATION_TYPES } from '../context/NotificationContext';
import { Layout } from '../components/Layout';
import { NoNotificationsEmpty } from '../components/EmptyState';
import { useConfirmDialog } from '../components/ConfirmDialog';
import { formatDate, getRelativeTime } from '../utils/dateUtils';

const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.MEMBER_JOINED]: UserPlus,
  [NOTIFICATION_TYPES.MEMBER_LEFT]: UserMinus,
  [NOTIFICATION_TYPES.MEMBER_STATUS]: Activity,
  [NOTIFICATION_TYPES.TRAVEL_UPDATE]: Plane,
  [NOTIFICATION_TYPES.ITINERARY_ADDED]: CalendarPlus,
  [NOTIFICATION_TYPES.ITINERARY_UPDATED]: CalendarClock,
  [NOTIFICATION_TYPES.ITINERARY_DELETED]: CalendarX,
  [NOTIFICATION_TYPES.EVENT_REMINDER]: Clock,
  [NOTIFICATION_TYPES.TRIP_STARTING]: MapPin,
  [NOTIFICATION_TYPES.CHAT_MESSAGE]: MessageCircle,
  [NOTIFICATION_TYPES.BIRTHDAY]: Cake,
  [NOTIFICATION_TYPES.SYSTEM]: Info,
};

const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPES.MEMBER_JOINED]: 'bg-success-100 text-success-600',
  [NOTIFICATION_TYPES.MEMBER_LEFT]: 'bg-gray-100 text-gray-600',
  [NOTIFICATION_TYPES.MEMBER_STATUS]: 'bg-primary-100 text-primary-600',
  [NOTIFICATION_TYPES.TRAVEL_UPDATE]: 'bg-blue-100 text-blue-600',
  [NOTIFICATION_TYPES.ITINERARY_ADDED]: 'bg-accent-100 text-accent-600',
  [NOTIFICATION_TYPES.ITINERARY_UPDATED]: 'bg-warning-100 text-warning-600',
  [NOTIFICATION_TYPES.ITINERARY_DELETED]: 'bg-danger-100 text-danger-600',
  [NOTIFICATION_TYPES.EVENT_REMINDER]: 'bg-orange-100 text-orange-600',
  [NOTIFICATION_TYPES.TRIP_STARTING]: 'bg-green-100 text-green-600',
  [NOTIFICATION_TYPES.CHAT_MESSAGE]: 'bg-indigo-100 text-indigo-600',
  [NOTIFICATION_TYPES.BIRTHDAY]: 'bg-pink-100 text-pink-600',
  [NOTIFICATION_TYPES.SYSTEM]: 'bg-gray-100 text-gray-600',
};

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getGroupedNotifications,
  } = useNotifications();
  const { confirm, DialogComponent } = useConfirmDialog();

  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const groupedNotifications = getGroupedNotifications();

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Clear All Notifications',
      message: 'Are you sure you want to delete all notifications? This cannot be undone.',
      variant: 'danger',
      confirmText: 'Clear All',
    });

    if (confirmed) {
      await clearAll();
    }
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
  };

  const renderNotificationGroup = (title, items) => {
    if (items.length === 0) return null;

    const filteredItems = filter === 'unread' ? items.filter(n => !n.read) : items;
    if (filteredItems.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">{title}</h3>
        <div className="space-y-2">
          {filteredItems.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={() => markAsRead(notification.id)}
              onDelete={() => handleDelete(notification.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn-secondary btn-sm"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn-ghost btn-sm text-gray-500"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <NoNotificationsEmpty />
        ) : (
          <div>
            {renderNotificationGroup('Today', groupedNotifications.today)}
            {renderNotificationGroup('Yesterday', groupedNotifications.yesterday)}
            {renderNotificationGroup('Earlier', groupedNotifications.older)}
          </div>
        )}
      </div>

      <DialogComponent />
    </Layout>
  );
}

// Notification Item Component
function NotificationItem({ notification, onRead, onDelete }) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
  const colorClass = NOTIFICATION_COLORS[notification.type] || 'bg-gray-100 text-gray-600';

  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`card p-4 cursor-pointer transition-all ${
        notification.read
          ? 'bg-white'
          : 'bg-primary-50/50 border-primary-100'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </p>
              <p className={`text-sm mt-0.5 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                {notification.message}
              </p>
            </div>

            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {getRelativeTime(notification.createdAt)}
            </span>

            <div className="flex items-center gap-1">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRead();
                  }}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {notification.groupName && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {notification.groupName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
