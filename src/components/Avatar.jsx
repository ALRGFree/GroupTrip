import React from 'react';
import { getInitials, stringToGradient } from '../utils/helpers';

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const STATUS_COLORS = {
  online: 'bg-success-500',
  available: 'bg-success-500',
  away: 'bg-warning-500',
  busy: 'bg-danger-500',
  traveling: 'bg-primary-500',
  arrived: 'bg-success-500',
  'checked-in': 'bg-success-500',
  exploring: 'bg-accent-500',
  resting: 'bg-gray-400',
  offline: 'bg-gray-400',
};

const STATUS_SIZE = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border-2',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-2',
};

export function Avatar({
  name,
  src,
  size = 'md',
  status,
  showStatus = false,
  className = '',
  onClick,
}) {
  const initials = getInitials(name);
  const gradient = stringToGradient(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const statusSizeClass = STATUS_SIZE[size] || STATUS_SIZE.md;
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.offline;

  const avatarStyle = src
    ? {}
    : {
        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
      };

  return (
    <div
      className={`relative inline-flex ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          className={`${sizeClass} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white`}
          style={avatarStyle}
        >
          {initials}
        </div>
      )}

      {showStatus && status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizeClass} ${statusColor} rounded-full border-white ${
            status === 'traveling' ? 'animate-pulse-soft' : ''
          }`}
          title={status}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  users,
  max = 4,
  size = 'md',
  showStatus = false,
  className = '',
}) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const overlapClass = {
    xs: '-ml-2',
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
    '2xl': '-ml-6',
  }[size] || '-ml-3';

  return (
    <div className={`flex items-center ${className}`}>
      {displayUsers.map((user, index) => (
        <div
          key={user.id || index}
          className={index > 0 ? overlapClass : ''}
          style={{ zIndex: displayUsers.length - index }}
        >
          <Avatar
            name={user.name}
            src={user.avatar}
            size={size}
            status={user.status}
            showStatus={showStatus}
          />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={`${sizeClass} ${overlapClass} rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-semibold ring-2 ring-white`}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

export function AvatarWithName({
  name,
  src,
  subtitle,
  size = 'md',
  status,
  showStatus = false,
  onClick,
  className = '',
}) {
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl',
  };

  const subtitleSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    '2xl': 'text-lg',
  };

  return (
    <div
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <Avatar
        name={name}
        src={src}
        size={size}
        status={status}
        showStatus={showStatus}
      />
      <div className="min-w-0">
        <p className={`${textSizes[size]} font-medium text-gray-900 truncate`}>
          {name}
        </p>
        {subtitle && (
          <p className={`${subtitleSizes[size]} text-gray-500 truncate`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status, showLabel = true, size = 'md' }) {
  const statusLabels = {
    online: 'Online',
    available: 'Available',
    away: 'Away',
    busy: 'Busy',
    traveling: 'Traveling',
    arrived: 'Arrived',
    'checked-in': 'Checked In',
    exploring: 'Exploring',
    resting: 'Resting',
    offline: 'Offline',
  };

  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.offline;
  const label = statusLabels[status] || status;

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`${dotSizes[size]} ${statusColor} rounded-full ${
          status === 'traveling' ? 'animate-pulse-soft' : ''
        }`}
      />
      {showLabel && (
        <span className={`${textSizes[size]} text-gray-600 capitalize`}>
          {label}
        </span>
      )}
    </div>
  );
}

export default Avatar;
