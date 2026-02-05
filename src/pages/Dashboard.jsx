import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  Plane,
  Clock,
  Plus,
  Share2,
  Settings,
  ChevronRight,
  Copy,
  Check,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import { useUser } from '../context/UserContext';
import { Layout } from '../components/Layout';
import { Avatar, AvatarGroup, StatusBadge } from '../components/Avatar';
import { CountdownTimer, TripCountdown } from '../components/CountdownTimer';
import { NoTripsEmpty, NoEventsEmpty } from '../components/EmptyState';
import { FormModal } from '../components/Modal';
import { formatDate, formatTime, sortByDate, isToday, isFuture } from '../utils/dateUtils';
import { copyToClipboard } from '../utils/exportUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { currentGroup, members, events, updateGroup, isAdmin } = useGroup();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editName, setEditName] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Get upcoming events
  const upcomingEvents = useMemo(() => {
    if (!events.length) return [];
    return sortByDate(
      events.filter(e => isFuture(e.datetime) || isToday(e.datetime)),
      'datetime'
    ).slice(0, 5);
  }, [events]);

  // Get members with travel status
  const membersByStatus = useMemo(() => {
    const statuses = {
      traveling: [],
      arrived: [],
      planning: [],
    };

    members.forEach(member => {
      const status = member.travelStatus || 'planning';
      if (statuses[status]) {
        statuses[status].push(member);
      } else {
        statuses.planning.push(member);
      }
    });

    return statuses;
  }, [members]);

  const handleCopyInviteCode = async () => {
    if (currentGroup?.inviteCode) {
      await copyToClipboard(currentGroup.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      await updateGroup({
        name: editName,
        destination: editDestination,
        startDate: editStartDate || null,
        endDate: editEndDate || null,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update group:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = () => {
    setEditName(currentGroup?.name || '');
    setEditDestination(currentGroup?.destination || '');
    setEditStartDate(currentGroup?.startDate?.split('T')[0] || '');
    setEditEndDate(currentGroup?.endDate?.split('T')[0] || '');
    setShowEditModal(true);
  };

  if (!currentGroup) {
    return (
      <Layout>
        <div className="p-6">
          <NoTripsEmpty
            onCreateTrip={() => navigate('/')}
            onJoinTrip={() => navigate('/')}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{currentGroup.name}</h1>
              {currentGroup.destination && (
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span>{currentGroup.destination}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAdmin() && (
                <button
                  onClick={openEditModal}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Edit trip"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowInviteModal(true)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Invite members"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trip dates and countdown */}
          {currentGroup.startDate && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-sm text-white/60">Trip Dates</p>
                  <p className="font-medium">
                    {formatDate(currentGroup.startDate, 'MMM d')}
                    {currentGroup.endDate && ` - ${formatDate(currentGroup.endDate, 'MMM d, yyyy')}`}
                  </p>
                </div>
              </div>
              <TripCountdown trip={currentGroup} className="text-white" />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/members"
            className="card p-4 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                <p className="text-xs text-gray-500">Members</p>
              </div>
            </div>
          </Link>

          <Link
            to="/itinerary"
            className="card p-4 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                <p className="text-xs text-gray-500">Events</p>
              </div>
            </div>
          </Link>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                <Plane className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {membersByStatus.arrived.length}
                </p>
                <p className="text-xs text-gray-500">Arrived</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {membersByStatus.traveling.length}
                </p>
                <p className="text-xs text-gray-500">Traveling</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
              <Link
                to="/itinerary"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="card-body p-0">
              {upcomingEvents.length === 0 ? (
                <NoEventsEmpty onAddEvent={() => navigate('/itinerary')} />
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      to="/itinerary"
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 text-center flex-shrink-0">
                        <p className="text-xs text-gray-500 uppercase">
                          {formatDate(event.datetime, 'MMM')}
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatDate(event.datetime, 'd')}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(event.datetime)}
                          {event.location && ` · ${event.location}`}
                        </p>
                      </div>
                      {event.category && (
                        <span className="badge-gray flex-shrink-0">
                          {event.category}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Group Members */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Group Members</h2>
              <Link
                to="/members"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="card-body">
              {/* Status Summary */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                {membersByStatus.traveling.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="status-dot-traveling" />
                    <span className="text-sm text-gray-600">
                      {membersByStatus.traveling.length} traveling
                    </span>
                  </div>
                )}
                {membersByStatus.arrived.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="status-dot-online" />
                    <span className="text-sm text-gray-600">
                      {membersByStatus.arrived.length} arrived
                    </span>
                  </div>
                )}
              </div>

              {/* Member List */}
              <div className="space-y-3">
                {members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.name}
                        size="md"
                        status={member.travelStatus}
                        showStatus
                      />
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <StatusBadge status={member.travelStatus} size="sm" />
                      </div>
                    </div>
                    {member.role === 'admin' && (
                      <span className="badge-primary">Admin</span>
                    )}
                  </div>
                ))}

                {members.length > 5 && (
                  <Link
                    to="/members"
                    className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
                  >
                    +{members.length - 5} more members
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-4">
          <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/travel" className="btn-secondary btn-sm">
              <Plane className="w-4 h-4" />
              Add My Travel
            </Link>
            <Link to="/itinerary" className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Add Event
            </Link>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-secondary btn-sm"
            >
              <Share2 className="w-4 h-4" />
              Invite Members
            </button>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <FormModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={(e) => {
          e.preventDefault();
          setShowInviteModal(false);
        }}
        title="Invite Members"
        description="Share this code with friends and family to join your trip."
        submitText="Done"
      >
        <div className="text-center py-4">
          <div className="bg-gray-100 rounded-xl p-6 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Invite Code
            </p>
            <p className="text-4xl font-mono font-bold text-gray-900 tracking-widest">
              {currentGroup.inviteCode}
            </p>
          </div>

          <button
            onClick={handleCopyInviteCode}
            className="btn-secondary w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-success-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Anyone with this code can join your trip
          </p>
        </div>
      </FormModal>

      {/* Edit Trip Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditGroup}
        title="Edit Trip"
        submitText="Save Changes"
        loading={editLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Trip Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Destination</label>
            <input
              type="text"
              value={editDestination}
              onChange={(e) => setEditDestination(e.target.value)}
              className="input"
              placeholder="e.g., Miami, Florida"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                min={editStartDate}
                className="input"
              />
            </div>
          </div>
        </div>
      </FormModal>
    </Layout>
  );
}
