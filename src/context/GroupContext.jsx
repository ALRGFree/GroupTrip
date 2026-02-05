import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { generateId, generateInviteCode } from '../utils/helpers';
import { useUser } from './UserContext';

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const { user, userId } = useUser();
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load groups list on mount
  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);
        const storedGroups = await getItem(STORAGE_KEYS.GROUPS_LIST, []);
        setGroups(storedGroups);
      } catch (err) {
        console.error('Failed to load groups:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  // Load group data when current group changes
  useEffect(() => {
    async function loadGroupData() {
      if (!currentGroup?.id) {
        setMembers([]);
        setEvents([]);
        return;
      }

      try {
        const groupId = currentGroup.id;
        const [storedMembers, storedEvents] = await Promise.all([
          getItem(STORAGE_KEYS.GROUP_MEMBERS, [], { groupId }),
          getItem(STORAGE_KEYS.GROUP_EVENTS, [], { groupId }),
        ]);

        setMembers(storedMembers);
        setEvents(storedEvents);
      } catch (err) {
        console.error('Failed to load group data:', err);
        setError(err.message);
      }
    }

    loadGroupData();
  }, [currentGroup?.id]);

  // Create a new group
  const createGroup = useCallback(async (groupData) => {
    if (!user) throw new Error('User must be logged in to create a group');

    try {
      const newGroup = {
        id: generateId(),
        inviteCode: generateInviteCode(),
        name: groupData.name,
        destination: groupData.destination || '',
        description: groupData.description || '',
        startDate: groupData.startDate || null,
        endDate: groupData.endDate || null,
        coverImage: groupData.coverImage || null,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add creator as first member with admin role
      const creatorMember = {
        id: generateId(),
        userId: userId,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: 'admin',
        status: 'confirmed',
        travelStatus: 'planning',
        joinedAt: new Date().toISOString(),
        flights: [],
        drives: [],
        accommodations: [],
      };

      // Update groups list
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      await setItem(STORAGE_KEYS.GROUPS_LIST, updatedGroups, { shared: false });

      // Save group info
      await setItem(STORAGE_KEYS.GROUP_INFO, newGroup, { shared: true, groupId: newGroup.id });

      // Save members
      await setItem(STORAGE_KEYS.GROUP_MEMBERS, [creatorMember], { shared: true, groupId: newGroup.id });

      // Initialize empty events
      await setItem(STORAGE_KEYS.GROUP_EVENTS, [], { shared: true, groupId: newGroup.id });

      setCurrentGroup(newGroup);
      setMembers([creatorMember]);
      setEvents([]);

      return newGroup;
    } catch (err) {
      console.error('Failed to create group:', err);
      setError(err.message);
      throw err;
    }
  }, [user, userId, groups]);

  // Join an existing group
  const joinGroup = useCallback(async (inviteCode) => {
    if (!user) throw new Error('User must be logged in to join a group');

    try {
      // Find group by invite code
      const allGroups = await getItem(STORAGE_KEYS.GROUPS_LIST, []);
      let targetGroup = allGroups.find(g => g.inviteCode === inviteCode.toUpperCase());

      if (!targetGroup) {
        // Try to find in storage by checking each group
        for (const group of allGroups) {
          const groupInfo = await getItem(STORAGE_KEYS.GROUP_INFO, null, { groupId: group.id });
          if (groupInfo?.inviteCode === inviteCode.toUpperCase()) {
            targetGroup = groupInfo;
            break;
          }
        }
      }

      if (!targetGroup) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      // Check if already a member
      const existingMembers = await getItem(STORAGE_KEYS.GROUP_MEMBERS, [], { groupId: targetGroup.id });
      const alreadyMember = existingMembers.some(m => m.userId === userId);

      if (alreadyMember) {
        // Just switch to this group
        setCurrentGroup(targetGroup);
        setMembers(existingMembers);
        return targetGroup;
      }

      // Add user as new member
      const newMember = {
        id: generateId(),
        userId: userId,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: 'member',
        status: 'confirmed',
        travelStatus: 'planning',
        joinedAt: new Date().toISOString(),
        flights: [],
        drives: [],
        accommodations: [],
      };

      const updatedMembers = [...existingMembers, newMember];
      await setItem(STORAGE_KEYS.GROUP_MEMBERS, updatedMembers, { shared: true, groupId: targetGroup.id });

      // Add to user's groups list
      const userGroups = groups.filter(g => g.id !== targetGroup.id);
      const updatedGroups = [...userGroups, targetGroup];
      setGroups(updatedGroups);
      await setItem(STORAGE_KEYS.GROUPS_LIST, updatedGroups, { shared: false });

      setCurrentGroup(targetGroup);
      setMembers(updatedMembers);

      return targetGroup;
    } catch (err) {
      console.error('Failed to join group:', err);
      setError(err.message);
      throw err;
    }
  }, [user, userId, groups]);

  // Update group info
  const updateGroup = useCallback(async (updates) => {
    if (!currentGroup) throw new Error('No group selected');

    try {
      const updatedGroup = {
        ...currentGroup,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update in groups list
      const updatedGroups = groups.map(g =>
        g.id === currentGroup.id ? updatedGroup : g
      );
      setGroups(updatedGroups);
      await setItem(STORAGE_KEYS.GROUPS_LIST, updatedGroups, { shared: false });

      // Update group info
      await setItem(STORAGE_KEYS.GROUP_INFO, updatedGroup, { shared: true, groupId: currentGroup.id });

      setCurrentGroup(updatedGroup);

      return updatedGroup;
    } catch (err) {
      console.error('Failed to update group:', err);
      setError(err.message);
      throw err;
    }
  }, [currentGroup, groups]);

  // Leave a group
  const leaveGroup = useCallback(async (groupId = null) => {
    const targetGroupId = groupId || currentGroup?.id;
    if (!targetGroupId) return;

    try {
      // Remove from members
      const groupMembers = await getItem(STORAGE_KEYS.GROUP_MEMBERS, [], { groupId: targetGroupId });
      const updatedMembers = groupMembers.filter(m => m.userId !== userId);
      await setItem(STORAGE_KEYS.GROUP_MEMBERS, updatedMembers, { shared: true, groupId: targetGroupId });

      // Remove from user's groups list
      const updatedGroups = groups.filter(g => g.id !== targetGroupId);
      setGroups(updatedGroups);
      await setItem(STORAGE_KEYS.GROUPS_LIST, updatedGroups, { shared: false });

      if (currentGroup?.id === targetGroupId) {
        setCurrentGroup(null);
        setMembers([]);
        setEvents([]);
      }
    } catch (err) {
      console.error('Failed to leave group:', err);
      setError(err.message);
      throw err;
    }
  }, [currentGroup, groups, userId]);

  // Switch to a different group
  const switchGroup = useCallback(async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setCurrentGroup(group);
    }
  }, [groups]);

  // Add event to itinerary
  const addEvent = useCallback(async (eventData) => {
    if (!currentGroup) throw new Error('No group selected');

    try {
      const newEvent = {
        id: generateId(),
        ...eventData,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      await setItem(STORAGE_KEYS.GROUP_EVENTS, updatedEvents, { shared: true, groupId: currentGroup.id });

      return newEvent;
    } catch (err) {
      console.error('Failed to add event:', err);
      setError(err.message);
      throw err;
    }
  }, [currentGroup, events, userId]);

  // Update an event
  const updateEvent = useCallback(async (eventId, updates) => {
    if (!currentGroup) throw new Error('No group selected');

    try {
      const updatedEvents = events.map(e =>
        e.id === eventId
          ? { ...e, ...updates, updatedAt: new Date().toISOString() }
          : e
      );

      setEvents(updatedEvents);
      await setItem(STORAGE_KEYS.GROUP_EVENTS, updatedEvents, { shared: true, groupId: currentGroup.id });

      return updatedEvents.find(e => e.id === eventId);
    } catch (err) {
      console.error('Failed to update event:', err);
      setError(err.message);
      throw err;
    }
  }, [currentGroup, events]);

  // Delete an event
  const deleteEvent = useCallback(async (eventId) => {
    if (!currentGroup) throw new Error('No group selected');

    try {
      const updatedEvents = events.filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      await setItem(STORAGE_KEYS.GROUP_EVENTS, updatedEvents, { shared: true, groupId: currentGroup.id });
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError(err.message);
      throw err;
    }
  }, [currentGroup, events]);

  // Duplicate an event
  const duplicateEvent = useCallback(async (eventId, newDatetime = null) => {
    const eventToDuplicate = events.find(e => e.id === eventId);
    if (!eventToDuplicate) throw new Error('Event not found');

    const duplicatedEvent = {
      ...eventToDuplicate,
      id: generateId(),
      title: `${eventToDuplicate.title} (Copy)`,
      datetime: newDatetime || eventToDuplicate.datetime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return addEvent(duplicatedEvent);
  }, [events, addEvent]);

  // Update member info
  const updateMember = useCallback(async (memberId, updates) => {
    if (!currentGroup) throw new Error('No group selected');

    try {
      const updatedMembers = members.map(m =>
        m.id === memberId
          ? { ...m, ...updates, updatedAt: new Date().toISOString() }
          : m
      );

      setMembers(updatedMembers);
      await setItem(STORAGE_KEYS.GROUP_MEMBERS, updatedMembers, { shared: true, groupId: currentGroup.id });

      return updatedMembers.find(m => m.id === memberId);
    } catch (err) {
      console.error('Failed to update member:', err);
      setError(err.message);
      throw err;
    }
  }, [currentGroup, members]);

  // Get current user's member record
  const getCurrentMember = useCallback(() => {
    return members.find(m => m.userId === userId);
  }, [members, userId]);

  // Update current user's travel details
  const updateMyTravelDetails = useCallback(async (type, details) => {
    const currentMember = getCurrentMember();
    if (!currentMember) throw new Error('Not a member of this group');

    const updates = {
      [type]: details,
    };

    return updateMember(currentMember.id, updates);
  }, [getCurrentMember, updateMember]);

  // Check if current user is admin
  const isAdmin = useCallback(() => {
    const currentMember = getCurrentMember();
    return currentMember?.role === 'admin';
  }, [getCurrentMember]);

  // Regenerate invite code (admin only)
  const regenerateInviteCode = useCallback(async () => {
    if (!isAdmin()) throw new Error('Only admins can regenerate invite codes');

    const newCode = generateInviteCode();
    await updateGroup({ inviteCode: newCode });
    return newCode;
  }, [isAdmin, updateGroup]);

  const value = {
    // State
    groups,
    currentGroup,
    members,
    events,
    loading,
    error,

    // Group actions
    createGroup,
    joinGroup,
    updateGroup,
    leaveGroup,
    switchGroup,
    regenerateInviteCode,

    // Event actions
    addEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,

    // Member actions
    updateMember,
    getCurrentMember,
    updateMyTravelDetails,

    // Helpers
    isAdmin,
    hasGroups: groups.length > 0,
    memberCount: members.length,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}

export default GroupContext;
