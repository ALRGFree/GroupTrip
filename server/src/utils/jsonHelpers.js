/**
 * Helper functions for JSON string handling (SQLite compatibility)
 */

export function parseJsonField(value, defaultValue = null) {
  if (!value) return defaultValue;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return defaultValue;
  }
}

export function stringifyJsonField(value) {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export function parseMemberTravelData(member) {
  if (!member) return member;
  return {
    ...member,
    flights: parseJsonField(member.flights, []),
    drives: parseJsonField(member.drives, []),
    accommodations: parseJsonField(member.accommodations, []),
  };
}

export function parseUserPreferences(user) {
  if (!user) return user;
  return {
    ...user,
    preferences: parseJsonField(user.preferences, {}),
  };
}

export function parseNotificationData(notification) {
  if (!notification) return notification;
  return {
    ...notification,
    data: parseJsonField(notification.data, {}),
  };
}
