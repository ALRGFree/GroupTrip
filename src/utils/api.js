/**
 * API client for GroupTrip backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('grouptrip_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('grouptrip_token', token);
    } else {
      localStorage.removeItem('grouptrip_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('grouptrip_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error || 'Request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error', 0);
    }
  }

  // Auth endpoints
  async register(email, password, name, phone) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    this.setToken(null);
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // User endpoints
  async updateProfile(updates) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getUserGroups() {
    return this.request('/users/groups');
  }

  // Group endpoints
  async getGroups() {
    return this.request('/groups');
  }

  async createGroup(groupData) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async joinGroup(inviteCode) {
    return this.request('/groups/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async getGroup(groupId) {
    return this.request(`/groups/${groupId}`);
  }

  async updateGroup(groupId, updates) {
    return this.request(`/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteGroup(groupId) {
    return this.request(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  async regenerateInviteCode(groupId) {
    return this.request(`/groups/${groupId}/regenerate-code`, {
      method: 'POST',
    });
  }

  async getGroupMembers(groupId) {
    return this.request(`/groups/${groupId}/members`);
  }

  async updateMember(groupId, memberId, updates) {
    return this.request(`/groups/${groupId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async removeMember(groupId, memberId) {
    return this.request(`/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async updateMyTravel(groupId, travelData) {
    return this.request(`/groups/${groupId}/my-travel`, {
      method: 'PATCH',
      body: JSON.stringify(travelData),
    });
  }

  // Event endpoints
  async getEvents(groupId, filters = {}) {
    const params = new URLSearchParams({ groupId, ...filters });
    return this.request(`/events?${params}`);
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  async updateEvent(eventId, updates) {
    return this.request(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async duplicateEvent(eventId, newDatetime) {
    return this.request(`/events/${eventId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newDatetime }),
    });
  }

  // Notification endpoints
  async getNotifications(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/notifications?${params}`);
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'POST',
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async clearAllNotifications() {
    return this.request('/notifications', {
      method: 'DELETE',
    });
  }
}

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient();
export { ApiError };
export default api;
