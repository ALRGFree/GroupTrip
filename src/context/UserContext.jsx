import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';

const UserContext = createContext(null);

const DEFAULT_PREFERENCES = {
  notifications: {
    tripUpdates: true,
    memberChanges: true,
    itineraryChanges: true,
    reminders24h: true,
    reminders1h: true,
    statusUpdates: true,
    chatMessages: true,
  },
  display: {
    theme: 'light',
    compactView: false,
    showTimezones: true,
    use24HourTime: false,
  },
  privacy: {
    shareLocation: false,
    showEmail: true,
    showPhone: false,
  },
};

const DEFAULT_USER = {
  id: null,
  name: '',
  email: '',
  phone: '',
  avatar: null,
  status: 'offline',
  statusMessage: '',
  birthday: null,
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
  },
  createdAt: null,
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user and preferences on mount
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const storedUser = await getItem(STORAGE_KEYS.CURRENT_USER);
        const storedPrefs = await getItem(STORAGE_KEYS.USER_PREFERENCES);

        if (storedUser) {
          setUser(storedUser);
        }

        if (storedPrefs) {
          setPreferences(prev => ({ ...prev, ...storedPrefs }));
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Create or update user profile
  const updateUser = useCallback(async (updates) => {
    try {
      const updatedUser = user
        ? { ...user, ...updates, updatedAt: new Date().toISOString() }
        : {
            ...DEFAULT_USER,
            ...updates,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      setUser(updatedUser);
      await setItem(STORAGE_KEYS.CURRENT_USER, updatedUser, { shared: false });

      return updatedUser;
    } catch (err) {
      console.error('Failed to update user:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  // Update user status
  const updateStatus = useCallback(async (status, statusMessage = '') => {
    if (!user) return;

    const updatedUser = {
      ...user,
      status,
      statusMessage,
      lastStatusUpdate: new Date().toISOString(),
    };

    setUser(updatedUser);
    await setItem(STORAGE_KEYS.CURRENT_USER, updatedUser, { shared: false });

    return updatedUser;
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (updates) => {
    try {
      const updatedPrefs = {
        ...preferences,
        ...updates,
        notifications: {
          ...preferences.notifications,
          ...(updates.notifications || {}),
        },
        display: {
          ...preferences.display,
          ...(updates.display || {}),
        },
        privacy: {
          ...preferences.privacy,
          ...(updates.privacy || {}),
        },
      };

      setPreferences(updatedPrefs);
      await setItem(STORAGE_KEYS.USER_PREFERENCES, updatedPrefs, { shared: false });

      return updatedPrefs;
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError(err.message);
      throw err;
    }
  }, [preferences]);

  // Check if user is set up (has required info)
  const isSetUp = useCallback(() => {
    return user && user.name && user.name.trim().length > 0;
  }, [user]);

  // Clear user data (logout)
  const clearUser = useCallback(async () => {
    try {
      setUser(null);
      setPreferences(DEFAULT_PREFERENCES);
      await setItem(STORAGE_KEYS.CURRENT_USER, null, { shared: false });
      await setItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES, { shared: false });
    } catch (err) {
      console.error('Failed to clear user:', err);
    }
  }, []);

  // Quick status updates
  const setQuickStatus = useCallback(async (quickStatus) => {
    const statusMap = {
      'traveling': { status: 'traveling', message: 'On the way' },
      'arrived': { status: 'arrived', message: 'Arrived at destination' },
      'checked-in': { status: 'checked-in', message: 'Checked in' },
      'exploring': { status: 'exploring', message: 'Out exploring' },
      'resting': { status: 'resting', message: 'Resting at accommodation' },
      'available': { status: 'available', message: 'Available' },
      'busy': { status: 'busy', message: 'Busy' },
      'offline': { status: 'offline', message: '' },
    };

    const { status, message } = statusMap[quickStatus] || statusMap['offline'];
    return updateStatus(status, message);
  }, [updateStatus]);

  const value = {
    user,
    preferences,
    loading,
    error,
    updateUser,
    updateStatus,
    updatePreferences,
    isSetUp,
    clearUser,
    setQuickStatus,
    // Convenience getters
    isLoggedIn: !!user?.id,
    userName: user?.name || 'Guest',
    userId: user?.id,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
