import React from 'react';
import {
  Calendar,
  Users,
  Plane,
  MapPin,
  Bell,
  MessageCircle,
  Search,
  FolderOpen,
  Inbox,
  Plus,
} from 'lucide-react';

const PRESETS = {
  noTrips: {
    icon: MapPin,
    title: 'No trips yet',
    description: 'Create your first trip or join an existing one with an invite code.',
  },
  noMembers: {
    icon: Users,
    title: 'No members yet',
    description: 'Share your invite code to add members to this trip.',
  },
  noEvents: {
    icon: Calendar,
    title: 'No events scheduled',
    description: 'Start building your itinerary by adding activities and events.',
  },
  noFlights: {
    icon: Plane,
    title: 'No flight information',
    description: 'Add your flight details so the group knows when you arrive.',
  },
  noNotifications: {
    icon: Bell,
    title: 'All caught up!',
    description: "You don't have any notifications right now.",
  },
  noMessages: {
    icon: MessageCircle,
    title: 'No messages yet',
    description: 'Start a conversation with your travel group.',
  },
  noResults: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  },
  noData: {
    icon: FolderOpen,
    title: 'No data available',
    description: 'There is nothing to display here yet.',
  },
  emptyInbox: {
    icon: Inbox,
    title: 'Your inbox is empty',
    description: 'Messages and updates will appear here.',
  },
};

export function EmptyState({
  preset,
  icon: CustomIcon,
  title,
  description,
  action,
  actionText,
  actionIcon: ActionIcon = Plus,
  className = '',
}) {
  const presetConfig = preset ? PRESETS[preset] : null;
  const Icon = CustomIcon || presetConfig?.icon || FolderOpen;
  const displayTitle = title || presetConfig?.title || 'Nothing here';
  const displayDescription = description || presetConfig?.description || '';

  return (
    <div className={`empty-state ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon className="empty-state-icon w-8 h-8" />
      </div>
      <h3 className="empty-state-title">{displayTitle}</h3>
      {displayDescription && (
        <p className="empty-state-description">{displayDescription}</p>
      )}
      {action && (
        <button
          onClick={action}
          className="btn-primary mt-6"
        >
          <ActionIcon className="w-4 h-4" />
          {actionText || 'Get Started'}
        </button>
      )}
    </div>
  );
}

// Specific empty states for common use cases
export function NoTripsEmpty({ onCreateTrip, onJoinTrip }) {
  return (
    <div className="empty-state">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 mb-6">
        <MapPin className="w-10 h-10 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Start Your Adventure
      </h3>
      <p className="text-gray-500 max-w-sm mb-8">
        Create a new trip to start planning with friends and family, or join an existing trip with an invite code.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onCreateTrip} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Trip
        </button>
        <button onClick={onJoinTrip} className="btn-secondary">
          <Users className="w-4 h-4" />
          Join Trip
        </button>
      </div>
    </div>
  );
}

export function NoEventsEmpty({ onAddEvent }) {
  return (
    <div className="empty-state py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
        <Calendar className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Your itinerary is empty
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Start planning your trip by adding activities, meals, and meeting points.
      </p>
      {onAddEvent && (
        <button onClick={onAddEvent} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add First Event
        </button>
      )}
    </div>
  );
}

export function NoMembersEmpty({ inviteCode, onShare }) {
  return (
    <div className="empty-state py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-50 mb-4">
        <Users className="w-8 h-8 text-accent-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Invite your travel buddies
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-4">
        Share the invite code below so others can join your trip.
      </p>
      {inviteCode && (
        <div className="bg-gray-100 rounded-lg px-6 py-3 mb-4">
          <span className="font-mono text-2xl font-bold text-gray-800 tracking-wider">
            {inviteCode}
          </span>
        </div>
      )}
      {onShare && (
        <button onClick={onShare} className="btn-secondary">
          Share Invite
        </button>
      )}
    </div>
  );
}

export function NoSearchResults({ query, onClear }) {
  return (
    <div className="empty-state py-12">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
        <Search className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        No results for "{query}"
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Try different keywords or check your spelling.
      </p>
      {onClear && (
        <button onClick={onClear} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Clear search
        </button>
      )}
    </div>
  );
}

export function NoNotificationsEmpty() {
  return (
    <div className="empty-state py-12">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-50 mb-4">
        <Bell className="w-7 h-7 text-success-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        All caught up!
      </h3>
      <p className="text-sm text-gray-500">
        You'll be notified when there are updates to your trips.
      </p>
    </div>
  );
}

export function NoTravelDetailsEmpty({ type, onAdd }) {
  const config = {
    flights: {
      icon: Plane,
      title: 'No flight information',
      description: 'Add your flight details so the group knows your travel plans.',
      buttonText: 'Add Flight',
    },
    drives: {
      icon: MapPin,
      title: 'No driving information',
      description: 'Add your drive details if you\'re traveling by car.',
      buttonText: 'Add Drive',
    },
    accommodations: {
      icon: MapPin,
      title: 'No accommodation added',
      description: 'Add where you\'re staying during the trip.',
      buttonText: 'Add Accommodation',
    },
  };

  const { icon: Icon, title, description, buttonText } = config[type] || config.flights;

  return (
    <div className="text-center py-8 px-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">{description}</p>
      {onAdd && (
        <button onClick={onAdd} className="btn-secondary btn-sm">
          <Plus className="w-3 h-3" />
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
