/**
 * Storage utility for GroupTrip
 * Uses window.storage API for persistent data with shared/private options
 * Falls back to localStorage for development/testing
 */

const USE_WINDOW_STORAGE = typeof window !== 'undefined' && window.storage;

// In-memory cache for faster reads
const cache = new Map();

// Event listeners for storage changes
const listeners = new Map();

/**
 * Generate a storage key with optional group prefix
 */
function getKey(key, groupId = null) {
  if (groupId) {
    return `grouptrip:${groupId}:${key}`;
  }
  return `grouptrip:${key}`;
}

/**
 * Set a value in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON serialized)
 * @param {Object} options - Storage options
 * @param {boolean} options.shared - Whether data is shared across group (default: false)
 * @param {string} options.groupId - Group ID for group-scoped data
 */
export async function setItem(key, value, options = {}) {
  const { shared = false, groupId = null } = options;
  const storageKey = getKey(key, groupId);
  const serialized = JSON.stringify(value);

  // Update cache
  cache.set(storageKey, value);

  if (USE_WINDOW_STORAGE) {
    try {
      await window.storage.setItem(storageKey, serialized, { shared });
    } catch (error) {
      console.error('Storage setItem error:', error);
      // Fallback to localStorage
      localStorage.setItem(storageKey, serialized);
    }
  } else {
    localStorage.setItem(storageKey, serialized);
  }

  // Notify listeners
  notifyListeners(storageKey, value);
}

/**
 * Get a value from storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @param {Object} options - Storage options
 * @param {string} options.groupId - Group ID for group-scoped data
 */
export async function getItem(key, defaultValue = null, options = {}) {
  const { groupId = null } = options;
  const storageKey = getKey(key, groupId);

  // Check cache first
  if (cache.has(storageKey)) {
    return cache.get(storageKey);
  }

  let value = null;

  if (USE_WINDOW_STORAGE) {
    try {
      const result = await window.storage.getItem(storageKey);
      value = result ? JSON.parse(result) : defaultValue;
    } catch (error) {
      console.error('Storage getItem error:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(storageKey);
      value = stored ? JSON.parse(stored) : defaultValue;
    }
  } else {
    const stored = localStorage.getItem(storageKey);
    value = stored ? JSON.parse(stored) : defaultValue;
  }

  // Update cache
  if (value !== null) {
    cache.set(storageKey, value);
  }

  return value;
}

/**
 * Remove a value from storage
 */
export async function removeItem(key, options = {}) {
  const { groupId = null } = options;
  const storageKey = getKey(key, groupId);

  cache.delete(storageKey);

  if (USE_WINDOW_STORAGE) {
    try {
      await window.storage.removeItem(storageKey);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      localStorage.removeItem(storageKey);
    }
  } else {
    localStorage.removeItem(storageKey);
  }

  notifyListeners(storageKey, null);
}

/**
 * Get all keys matching a pattern
 */
export async function getKeys(pattern = '', options = {}) {
  const { groupId = null } = options;
  const prefix = getKey(pattern, groupId);

  if (USE_WINDOW_STORAGE) {
    try {
      const keys = await window.storage.keys();
      return keys.filter(k => k.startsWith(prefix));
    } catch (error) {
      console.error('Storage getKeys error:', error);
    }
  }

  // Fallback to localStorage
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Clear all GroupTrip data
 */
export async function clearAll() {
  const keys = await getKeys('');
  for (const key of keys) {
    if (USE_WINDOW_STORAGE) {
      try {
        await window.storage.removeItem(key);
      } catch (error) {
        localStorage.removeItem(key);
      }
    } else {
      localStorage.removeItem(key);
    }
  }
  cache.clear();
}

/**
 * Subscribe to storage changes
 */
export function subscribe(key, callback, options = {}) {
  const { groupId = null } = options;
  const storageKey = getKey(key, groupId);

  if (!listeners.has(storageKey)) {
    listeners.set(storageKey, new Set());
  }
  listeners.get(storageKey).add(callback);

  // Return unsubscribe function
  return () => {
    const keyListeners = listeners.get(storageKey);
    if (keyListeners) {
      keyListeners.delete(callback);
    }
  };
}

/**
 * Notify all listeners of a change
 */
function notifyListeners(storageKey, value) {
  const keyListeners = listeners.get(storageKey);
  if (keyListeners) {
    keyListeners.forEach(callback => {
      try {
        callback(value);
      } catch (error) {
        console.error('Storage listener error:', error);
      }
    });
  }
}

/**
 * Batch get multiple items
 */
export async function getItems(keys, options = {}) {
  const results = {};
  await Promise.all(
    keys.map(async (key) => {
      results[key] = await getItem(key, null, options);
    })
  );
  return results;
}

/**
 * Batch set multiple items
 */
export async function setItems(items, options = {}) {
  await Promise.all(
    Object.entries(items).map(([key, value]) =>
      setItem(key, value, options)
    )
  );
}

// Storage keys constants
export const STORAGE_KEYS = {
  // User-specific (shared: false)
  CURRENT_USER: 'currentUser',
  USER_PREFERENCES: 'userPreferences',
  NOTIFICATION_SETTINGS: 'notificationSettings',

  // Group-specific (shared: true, with groupId)
  GROUP_INFO: 'groupInfo',
  GROUP_MEMBERS: 'members',
  GROUP_ITINERARY: 'itinerary',
  GROUP_EVENTS: 'events',
  GROUP_CHAT: 'chat',

  // Travel details (shared: true, with groupId)
  TRAVEL_FLIGHTS: 'flights',
  TRAVEL_DRIVES: 'drives',
  TRAVEL_ACCOMMODATIONS: 'accommodations',

  // App-wide
  GROUPS_LIST: 'groupsList',
  NOTIFICATIONS: 'notifications',
};

export default {
  setItem,
  getItem,
  removeItem,
  getKeys,
  clearAll,
  subscribe,
  getItems,
  setItems,
  STORAGE_KEYS,
};
