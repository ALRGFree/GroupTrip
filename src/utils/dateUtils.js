/**
 * Date and time utilities for GroupTrip
 */

import {
  format,
  formatDistanceToNow,
  formatDistance,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  isSameDay,
  addDays,
  addHours,
  addMinutes,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isWithinInterval,
  compareAsc,
} from 'date-fns';

import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatStr = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, formatStr);
}

/**
 * Format a time for display
 * @param {Date|string} date - Date to format
 * @param {boolean} includeSeconds - Whether to include seconds
 * @returns {string} Formatted time string
 */
export function formatTime(date, includeSeconds = false) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, includeSeconds ? 'h:mm:ss a' : 'h:mm a');
}

/**
 * Format date and time together
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'MMM d, yyyy \'at\' h:mm a');
}

/**
 * Format date in a specific timezone
 * @param {Date|string} date - Date to format
 * @param {string} timezone - Timezone string (e.g., 'America/New_York')
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date string in timezone
 */
export function formatInTimezone(date, timezone, formatStr = 'MMM d, yyyy h:mm a zzz') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d) || !timezone) return formatDate(d);
  try {
    return formatInTimeZone(d, timezone, formatStr);
  } catch (error) {
    console.error('Timezone format error:', error);
    return format(d, formatStr);
  }
}

/**
 * Convert a date to a specific timezone
 * @param {Date|string} date - Date to convert
 * @param {string} timezone - Target timezone
 * @returns {Date} Date in target timezone
 */
export function toTimezone(date, timezone) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d) || !timezone) return d;
  try {
    return toZonedTime(d, timezone);
  } catch (error) {
    console.error('Timezone conversion error:', error);
    return d;
  }
}

/**
 * Convert a zoned time to UTC
 * @param {Date} date - Zoned date
 * @param {string} timezone - Source timezone
 * @returns {Date} UTC date
 */
export function fromTimezone(date, timezone) {
  if (!isValid(date) || !timezone) return date;
  try {
    return fromZonedTime(date, timezone);
  } catch (error) {
    console.error('Timezone conversion error:', error);
    return date;
  }
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to compare
 * @param {Object} options - Options for formatDistanceToNow
 * @returns {string} Relative time string
 */
export function getRelativeTime(date, options = { addSuffix: true }) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, options);
}

/**
 * Get duration between two dates
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {string} Duration string
 */
export function getDuration(start, end) {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  if (!isValid(startDate) || !isValid(endDate)) return '';
  return formatDistance(startDate, endDate);
}

/**
 * Calculate countdown to a date
 * @param {Date|string} targetDate - Target date
 * @returns {Object} Countdown object with days, hours, minutes, seconds
 */
export function getCountdown(targetDate) {
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const now = new Date();

  if (!isValid(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const isPast = isBefore(target, now);
  const diff = isPast ? now - target : target - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast, total: diff };
}

/**
 * Format countdown for display
 * @param {Object} countdown - Countdown object from getCountdown
 * @returns {string} Formatted countdown string
 */
export function formatCountdown(countdown) {
  if (countdown.isPast) {
    return 'Event has passed';
  }

  const parts = [];
  if (countdown.days > 0) parts.push(`${countdown.days}d`);
  if (countdown.hours > 0) parts.push(`${countdown.hours}h`);
  if (countdown.minutes > 0) parts.push(`${countdown.minutes}m`);
  if (parts.length === 0) parts.push(`${countdown.seconds}s`);

  return parts.join(' ');
}

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export function isToday(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) && isSameDay(d, new Date());
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export function isPast(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) && isBefore(d, new Date());
}

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export function isFuture(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) && isAfter(d, new Date());
}

/**
 * Get all days in a date range
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {Array<Date>} Array of dates
 */
export function getDaysInRange(start, end) {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;

  if (!isValid(startDate) || !isValid(endDate)) return [];

  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Check if a date is within a range
 * @param {Date|string} date - Date to check
 * @param {Date|string} start - Range start
 * @param {Date|string} end - Range end
 * @returns {boolean}
 */
export function isInRange(date, start, end) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;

  if (!isValid(d) || !isValid(startDate) || !isValid(endDate)) return false;

  return isWithinInterval(d, { start: startDate, end: endDate });
}

/**
 * Sort dates in ascending order
 * @param {Array} dates - Array of dates or objects with date property
 * @param {string} key - Property key for date (if array of objects)
 * @returns {Array} Sorted array
 */
export function sortByDate(dates, key = null) {
  return [...dates].sort((a, b) => {
    const dateA = key ? (typeof a[key] === 'string' ? parseISO(a[key]) : a[key]) : (typeof a === 'string' ? parseISO(a) : a);
    const dateB = key ? (typeof b[key] === 'string' ? parseISO(b[key]) : b[key]) : (typeof b === 'string' ? parseISO(b) : b);
    return compareAsc(dateA, dateB);
  });
}

/**
 * Group items by date
 * @param {Array} items - Array of items with date property
 * @param {string} dateKey - Property key for date
 * @returns {Object} Object grouped by date string
 */
export function groupByDate(items, dateKey) {
  return items.reduce((groups, item) => {
    const date = item[dateKey];
    const d = typeof date === 'string' ? parseISO(date) : date;
    const dateStr = isValid(d) ? format(d, 'yyyy-MM-dd') : 'unknown';

    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(item);

    return groups;
  }, {});
}

/**
 * Calculate flight duration with timezone consideration
 * @param {string} departureTime - Departure datetime
 * @param {string} arrivalTime - Arrival datetime
 * @param {string} departureTimezone - Departure airport timezone
 * @param {string} arrivalTimezone - Arrival airport timezone
 * @returns {Object} Duration info
 */
export function calculateFlightDuration(departureTime, arrivalTime, departureTimezone, arrivalTimezone) {
  let depTime = parseISO(departureTime);
  let arrTime = parseISO(arrivalTime);

  if (!isValid(depTime) || !isValid(arrTime)) {
    return { hours: 0, minutes: 0, formatted: 'N/A' };
  }

  // Convert to UTC if timezones provided
  if (departureTimezone) {
    depTime = fromTimezone(depTime, departureTimezone);
  }
  if (arrivalTimezone) {
    arrTime = fromTimezone(arrTime, arrivalTimezone);
  }

  const diffMinutes = differenceInMinutes(arrTime, depTime);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return {
    hours,
    minutes,
    totalMinutes: diffMinutes,
    formatted: `${hours}h ${minutes}m`,
  };
}

/**
 * Get upcoming events within a time window
 * @param {Array} events - Array of events with datetime
 * @param {string} dateKey - Property key for datetime
 * @param {number} hoursAhead - Hours to look ahead (default: 24)
 * @returns {Array} Upcoming events
 */
export function getUpcomingEvents(events, dateKey, hoursAhead = 24) {
  const now = new Date();
  const futureLimit = addHours(now, hoursAhead);

  return events.filter(event => {
    const eventDate = typeof event[dateKey] === 'string' ? parseISO(event[dateKey]) : event[dateKey];
    return isValid(eventDate) && isWithinInterval(eventDate, { start: now, end: futureLimit });
  });
}

/**
 * Create a date string for datetime-local input
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted string for input
 */
export function toDatetimeLocal(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Create a date string for date input
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted string for input
 */
export function toDateInput(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}

/**
 * Parse datetime-local input value
 * @param {string} value - Input value
 * @returns {Date|null} Parsed date or null
 */
export function fromDatetimeLocal(value) {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

// Re-export commonly used date-fns functions as named exports
export {
  parseISO,
  isValid,
  addDays,
  addHours,
  addMinutes,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  startOfDay,
  endOfDay,
  isSameDay,
  isBefore,
  isAfter,
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatInTimezone,
  toTimezone,
  fromTimezone,
  getRelativeTime,
  getDuration,
  getCountdown,
  formatCountdown,
  isToday,
  isPast,
  isFuture,
  getDaysInRange,
  isInRange,
  sortByDate,
  groupByDate,
  calculateFlightDuration,
  getUpcomingEvents,
  toDatetimeLocal,
  toDateInput,
  fromDatetimeLocal,
};
