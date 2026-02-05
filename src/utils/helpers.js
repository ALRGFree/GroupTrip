/**
 * General helper utilities for GroupTrip
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID
 * @returns {string} UUID
 */
export function generateId() {
  return uuidv4();
}

/**
 * Generate a short invite code (6 characters)
 * @returns {string} Invite code
 */
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0,O,1,I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent color from a string (for avatars, etc.)
 * @param {string} str - Input string
 * @returns {string} HSL color string
 */
export function stringToColor(str) {
  if (!str) return 'hsl(210, 60%, 50%)';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Generate gradient colors from a string
 * @param {string} str - Input string
 * @returns {Object} Object with from and to colors
 */
export function stringToGradient(str) {
  if (!str) return { from: '#3b82f6', to: '#8b5cf6' };

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;

  return {
    from: `hsl(${hue1}, 65%, 55%)`,
    to: `hsl(${hue2}, 65%, 45%)`,
  };
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 * @param {string} str - Input string
 * @returns {string} Title case string
 */
export function titleCase(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
    );
  }
  return obj;
}

/**
 * Check if two objects are deeply equal
 * @param {any} a - First value
 * @param {any} b - Second value
 * @returns {boolean} Whether values are equal
 */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Group array items by a key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
}

/**
 * Sort array by multiple keys
 * @param {Array} array - Array to sort
 * @param {Array} keys - Array of {key, order} objects
 * @returns {Array} Sorted array
 */
export function sortByKeys(array, keys) {
  return [...array].sort((a, b) => {
    for (const { key, order = 'asc' } of keys) {
      const aVal = typeof key === 'function' ? key(a) : a[key];
      const bVal = typeof key === 'function' ? key(b) : b[key];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Filter array with multiple conditions
 * @param {Array} array - Array to filter
 * @param {Object} filters - Filter conditions
 * @returns {Array} Filtered array
 */
export function filterBy(array, filters) {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;

      const itemValue = item[key];

      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }

      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }

      return itemValue === value;
    });
  });
}

/**
 * Format a phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

/**
 * Get ordinal suffix for a number
 * @param {number} num - Number
 * @returns {string} Number with ordinal suffix
 */
export function getOrdinal(num) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = num % 100;
  const suffix = suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
  return `${num}${suffix}`;
}

/**
 * Pluralize a word
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, defaults to singular + 's')
 * @returns {string} Pluralized string with count
 */
export function pluralize(count, singular, plural = null) {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} Result of function
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}

/**
 * Create a query string from an object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
export function toQueryString(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * Parse a query string into an object
 * @param {string} queryString - Query string
 * @returns {Object} Parsed parameters
 */
export function parseQueryString(queryString) {
  if (!queryString) return {};

  const query = queryString.startsWith('?') ? queryString.slice(1) : queryString;

  return query.split('&').reduce((params, param) => {
    const [key, value] = param.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    return params;
  }, {});
}

/**
 * Check if running on mobile device
 * @returns {boolean}
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if running in standalone PWA mode
 * @returns {boolean}
 */
export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

export default {
  generateId,
  generateInviteCode,
  getInitials,
  stringToColor,
  stringToGradient,
  truncate,
  titleCase,
  debounce,
  throttle,
  deepClone,
  deepEqual,
  groupBy,
  sortByKeys,
  filterBy,
  formatPhone,
  isValidEmail,
  formatCurrency,
  formatNumber,
  getOrdinal,
  pluralize,
  sleep,
  retry,
  toQueryString,
  parseQueryString,
  isMobile,
  isStandalone,
};
