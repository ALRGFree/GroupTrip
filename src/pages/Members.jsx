import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plane,
  Car,
  Building,
  Clock,
  MapPin,
  Mail,
  Phone,
  Shield,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import { useUser } from '../context/UserContext';
import { Layout } from '../components/Layout';
import { Avatar, StatusBadge } from '../components/Avatar';
import { NoMembersEmpty } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { FlightRoute } from '../components/AirportAutocomplete';
import { formatDate, formatTime, formatDateTime } from '../utils/dateUtils';
import { copyToClipboard } from '../utils/exportUtils';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'arrived', label: 'Arrived' },
  { id: 'traveling', label: 'Traveling' },
  { id: 'planning', label: 'Planning' },
];

export default function Members() {
  const { userId } = useUser();
  const { currentGroup, members } = useGroup();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        m =>
          m.name.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(m => m.travelStatus === statusFilter);
    }

    // Sort: admins first, then by name
    result.sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [members, searchQuery, statusFilter]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: members.length,
      arrived: members.filter(m => m.travelStatus === 'arrived').length,
      traveling: members.filter(m => m.travelStatus === 'traveling').length,
      planning: members.filter(m => m.travelStatus === 'planning').length,
    };
  }, [members]);

  const handleCopyInviteCode = async () => {
    if (currentGroup?.inviteCode) {
      await copyToClipboard(currentGroup.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentGroup) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Please select a trip first</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600 mt-1">
              {members.length} travelers in this trip
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary"
          >
            <Share2 className="w-4 h-4" />
            Invite Members
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === filter.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                <span className="ml-1.5 text-xs opacity-70">
                  ({statusCounts[filter.id]})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          members.length === 0 ? (
            <NoMembersEmpty
              inviteCode={currentGroup.inviteCode}
              onShare={() => setShowInviteModal(true)}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No members match your search</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-primary-600 hover:text-primary-700 text-sm mt-2"
              >
                Clear filters
              </button>
            </div>
          )
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isCurrentUser={member.userId === userId}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        isCurrentUser={selectedMember?.userId === userId}
      />

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Members"
        description="Share this code with friends and family to join your trip."
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
      </Modal>
    </Layout>
  );
}

// Member Card Component
function MemberCard({ member, isCurrentUser, onClick }) {
  const hasFlights = member.flights?.length > 0;
  const hasDrives = member.drives?.length > 0;
  const hasAccommodations = member.accommodations?.length > 0;

  // Get next travel info
  const nextFlight = member.flights?.find(f => new Date(f.departureTime) > new Date());
  const nextDrive = member.drives?.find(d => new Date(d.departureTime) > new Date());

  return (
    <div
      onClick={onClick}
      className="card p-4 cursor-pointer hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start gap-4">
        <Avatar
          name={member.name}
          size="lg"
          status={member.travelStatus}
          showStatus
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {member.name}
              {isCurrentUser && (
                <span className="text-xs text-gray-500 font-normal ml-1">(You)</span>
              )}
            </h3>
            {member.role === 'admin' && (
              <span className="badge-primary">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>

          <StatusBadge status={member.travelStatus} size="sm" />

          {/* Travel Icons */}
          <div className="flex items-center gap-3 mt-3">
            <div
              className={`flex items-center gap-1 text-xs ${
                hasFlights ? 'text-primary-600' : 'text-gray-300'
              }`}
              title={hasFlights ? 'Has flight info' : 'No flight info'}
            >
              <Plane className="w-4 h-4" />
            </div>
            <div
              className={`flex items-center gap-1 text-xs ${
                hasDrives ? 'text-accent-600' : 'text-gray-300'
              }`}
              title={hasDrives ? 'Driving' : 'Not driving'}
            >
              <Car className="w-4 h-4" />
            </div>
            <div
              className={`flex items-center gap-1 text-xs ${
                hasAccommodations ? 'text-success-600' : 'text-gray-300'
              }`}
              title={hasAccommodations ? 'Has accommodation' : 'No accommodation'}
            >
              <Building className="w-4 h-4" />
            </div>
          </div>

          {/* Next travel info preview */}
          {(nextFlight || nextDrive) && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              {nextFlight ? (
                <div className="flex items-center gap-2">
                  <Plane className="w-3 h-3" />
                  <span>
                    {nextFlight.departureAirport} → {nextFlight.arrivalAirport}
                  </span>
                  <span className="text-gray-400">
                    {formatDate(nextFlight.departureTime, 'MMM d')}
                  </span>
                </div>
              ) : nextDrive ? (
                <div className="flex items-center gap-2">
                  <Car className="w-3 h-3" />
                  <span>Driving from {nextDrive.departureLocation}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Member Detail Modal
function MemberDetailModal({ member, isOpen, onClose, isCurrentUser }) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!member) return null;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      showCloseButton
    >
      {/* Header */}
      <div className="text-center pb-4 border-b">
        <Avatar
          name={member.name}
          size="xl"
          status={member.travelStatus}
          showStatus
          className="mx-auto mb-3"
        />
        <h2 className="text-xl font-bold text-gray-900">
          {member.name}
          {isCurrentUser && (
            <span className="text-sm text-gray-500 font-normal ml-2">(You)</span>
          )}
        </h2>
        <StatusBadge status={member.travelStatus} />

        {member.role === 'admin' && (
          <div className="mt-2">
            <span className="badge-primary">
              <Shield className="w-3 h-3" />
              Trip Admin
            </span>
          </div>
        )}
      </div>

      {/* Contact Info */}
      {(member.email || member.phone) && (
        <div className="py-4 border-b space-y-2">
          {member.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <a
                href={`mailto:${member.email}`}
                className="text-primary-600 hover:underline"
              >
                {member.email}
              </a>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <a
                href={`tel:${member.phone}`}
                className="text-primary-600 hover:underline"
              >
                {member.phone}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Flights Section */}
      {member.flights?.length > 0 && (
        <div className="py-4 border-b">
          <button
            onClick={() => toggleSection('flights')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary-600" />
              <span className="font-medium">
                Flights ({member.flights.length})
              </span>
            </div>
            {expandedSection === 'flights' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSection === 'flights' && (
            <div className="mt-4 space-y-4">
              {member.flights.map((flight, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">
                      {flight.airline} {flight.flightNumber}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(flight.departureTime, 'MMM d')}
                    </span>
                  </div>
                  <FlightRoute
                    from={flight.departureAirport}
                    to={flight.arrivalAirport}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500">Departs</p>
                      <p className="font-medium">{formatTime(flight.departureTime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Arrives</p>
                      <p className="font-medium">{formatTime(flight.arrivalTime)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drives Section */}
      {member.drives?.length > 0 && (
        <div className="py-4 border-b">
          <button
            onClick={() => toggleSection('drives')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-accent-600" />
              <span className="font-medium">
                Drives ({member.drives.length})
              </span>
            </div>
            {expandedSection === 'drives' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSection === 'drives' && (
            <div className="mt-4 space-y-4">
              {member.drives.map((drive, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{drive.departureLocation}</span>
                    <span className="text-gray-400">→</span>
                    <span>{drive.arrivalLocation}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Departs</p>
                      <p className="font-medium">{formatDateTime(drive.departureTime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ETA</p>
                      <p className="font-medium">{formatDateTime(drive.estimatedArrival)}</p>
                    </div>
                  </div>
                  {drive.vehicleInfo && (
                    <p className="text-sm text-gray-500 mt-2">{drive.vehicleInfo}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accommodations Section */}
      {member.accommodations?.length > 0 && (
        <div className="py-4">
          <button
            onClick={() => toggleSection('accommodations')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-success-600" />
              <span className="font-medium">
                Accommodations ({member.accommodations.length})
              </span>
            </div>
            {expandedSection === 'accommodations' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSection === 'accommodations' && (
            <div className="mt-4 space-y-4">
              {member.accommodations.map((acc, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">{acc.hotelName}</h4>
                  {acc.address && (
                    <p className="text-sm text-gray-500 flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {acc.address}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="font-medium">{formatDate(acc.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="font-medium">{formatDate(acc.checkOut)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No travel info */}
      {!member.flights?.length && !member.drives?.length && !member.accommodations?.length && (
        <div className="py-8 text-center text-gray-500">
          <p>No travel details added yet</p>
        </div>
      )}
    </Modal>
  );
}
