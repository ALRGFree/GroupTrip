import React, { useState } from 'react';
import {
  Plane,
  MapPin,
  CheckCircle,
  Coffee,
  Moon,
  Users,
  Clock,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useGroup } from '../context/GroupContext';
import { useNotifications } from '../context/NotificationContext';

const STATUS_OPTIONS = [
  {
    id: 'planning',
    label: 'Planning',
    icon: Clock,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    activeColor: 'bg-gray-500 text-white border-gray-500',
    description: 'Still preparing for the trip',
  },
  {
    id: 'traveling',
    label: 'Traveling',
    icon: Plane,
    color: 'bg-primary-50 text-primary-600 border-primary-200',
    activeColor: 'bg-primary-500 text-white border-primary-500',
    description: 'On the way to destination',
  },
  {
    id: 'arrived',
    label: 'Arrived',
    icon: MapPin,
    color: 'bg-success-50 text-success-600 border-success-200',
    activeColor: 'bg-success-500 text-white border-success-500',
    description: 'At the destination',
  },
  {
    id: 'checked-in',
    label: 'Checked In',
    icon: CheckCircle,
    color: 'bg-green-50 text-green-600 border-green-200',
    activeColor: 'bg-green-500 text-white border-green-500',
    description: 'Checked into accommodation',
  },
  {
    id: 'exploring',
    label: 'Exploring',
    icon: Coffee,
    color: 'bg-accent-50 text-accent-600 border-accent-200',
    activeColor: 'bg-accent-500 text-white border-accent-500',
    description: 'Out and about',
  },
  {
    id: 'resting',
    label: 'Resting',
    icon: Moon,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    activeColor: 'bg-indigo-500 text-white border-indigo-500',
    description: 'Taking a break',
  },
];

export function QuickStatusButton({ compact = false }) {
  const { user, setQuickStatus } = useUser();
  const { getCurrentMember, updateMember } = useGroup();
  const { notify } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentMember = getCurrentMember();
  const currentStatus = currentMember?.travelStatus || 'planning';
  const currentOption = STATUS_OPTIONS.find(s => s.id === currentStatus) || STATUS_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  const handleStatusChange = async (statusId) => {
    if (statusId === currentStatus) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      // Update user status
      await setQuickStatus(statusId);

      // Update member travel status in group
      if (currentMember) {
        await updateMember(currentMember.id, { travelStatus: statusId });
      }

      // Notify group
      const statusOption = STATUS_OPTIONS.find(s => s.id === statusId);
      notify.memberStatus(user?.name || 'Someone', statusOption?.label || statusId);

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${currentOption.color}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CurrentIcon className="w-4 h-4" />
          )}
          <span>{currentOption.label}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
              {STATUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = option.id === currentStatus;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleStatusChange(option.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                      isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isActive ? 'font-medium text-primary-600' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                    {isActive && (
                      <CheckCircle className="w-4 h-4 text-primary-600 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Your Status</h3>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-primary-600" />}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STATUS_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = option.id === currentStatus;
          return (
            <button
              key={option.id}
              onClick={() => handleStatusChange(option.id)}
              disabled={loading}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                isActive ? option.activeColor : `${option.color} hover:border-gray-300`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        {currentOption.description}
      </p>
    </div>
  );
}

// Status indicator pill for displaying current status
export function StatusPill({ status, size = 'md' }) {
  const option = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];
  const Icon = option.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${option.color} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {option.label}
    </span>
  );
}

// Live status indicator with animation
export function LiveStatusIndicator({ status }) {
  const isLive = ['traveling', 'exploring'].includes(status);
  const option = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          status === 'traveling'
            ? 'bg-primary-500 animate-pulse'
            : status === 'arrived' || status === 'checked-in'
            ? 'bg-success-500'
            : status === 'exploring'
            ? 'bg-accent-500 animate-pulse'
            : 'bg-gray-400'
        }`}
      />
      <span className="text-sm text-gray-600">{option.label}</span>
    </div>
  );
}

// Quick status bar for dashboard
export function QuickStatusBar() {
  const { getCurrentMember, members } = useGroup();
  const currentMember = getCurrentMember();

  // Count members by status
  const statusCounts = STATUS_OPTIONS.reduce((acc, option) => {
    acc[option.id] = members.filter(m => m.travelStatus === option.id).length;
    return acc;
  }, {});

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Group Status</h3>
        <span className="text-sm text-gray-500">{members.length} members</span>
      </div>

      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.filter(option => statusCounts[option.id] > 0).map((option) => {
          const percentage = (statusCounts[option.id] / members.length) * 100;
          return (
            <div
              key={option.id}
              className={`h-2 rounded-full ${option.activeColor.split(' ')[0]}`}
              style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '8px' : '0' }}
              title={`${option.label}: ${statusCounts[option.id]}`}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-3">
        {STATUS_OPTIONS.filter(option => statusCounts[option.id] > 0).map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.id} className="flex items-center gap-1.5 text-xs text-gray-600">
              <Icon className="w-3 h-3" />
              <span>{statusCounts[option.id]} {option.label.toLowerCase()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuickStatusButton;
