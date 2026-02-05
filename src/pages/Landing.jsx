import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  Calendar,
  Plane,
  Bell,
  Plus,
  ArrowRight,
  Sparkles,
  Globe,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useGroup } from '../context/GroupContext';
import { FormModal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';

const FEATURES = [
  {
    icon: Users,
    title: 'Group Coordination',
    description: 'Invite friends and family with a simple code. Everyone stays in sync.',
  },
  {
    icon: Plane,
    title: 'Travel Tracking',
    description: 'Share flight details, drive times, and see when everyone arrives.',
  },
  {
    icon: Calendar,
    title: 'Shared Itinerary',
    description: 'Build your schedule together. Add activities, meals, and meeting points.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get alerts for arrivals, departures, and upcoming events.',
  },
  {
    icon: Sparkles,
    title: 'AI Assistance',
    description: 'Get personalized suggestions for activities and restaurants.',
  },
  {
    icon: Globe,
    title: 'Timezone Smart',
    description: 'Automatic timezone handling so everyone knows the local time.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, isSetUp, updateUser } = useUser();
  const { createGroup, joinGroup, groups } = useGroup();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');

  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [inviteCode, setInviteCode] = useState('');

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!tripName.trim()) {
      setError('Please enter a trip name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ensure user is set up first
      if (!isSetUp()) {
        setShowCreateModal(false);
        setShowNameModal(true);
        return;
      }

      await createGroup({
        name: tripName.trim(),
        destination: destination.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
      });

      setShowCreateModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ensure user is set up first
      if (!isSetUp()) {
        setShowJoinModal(false);
        setShowNameModal(true);
        return;
      }

      await joinGroup(inviteCode.trim().toUpperCase());
      setShowJoinModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to join trip');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupUser = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateUser({
        name: userName.trim(),
        email: userEmail.trim(),
      });

      setShowNameModal(false);

      // Continue with the original action
      if (tripName) {
        setShowCreateModal(true);
      } else if (inviteCode) {
        setShowJoinModal(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = (action) => {
    if (!isSetUp()) {
      if (action === 'create') {
        setTripName('');
      } else {
        setInviteCode('');
      }
      setShowNameModal(true);
    } else {
      if (action === 'create') {
        setShowCreateModal(true);
      } else {
        setShowJoinModal(true);
      }
    }
  };

  // If user has groups, show quick access
  if (groups.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
            <p className="text-white/80">Continue planning or start a new adventure</p>
          </div>

          {/* Existing trips */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Trips</h2>
            <div className="space-y-3">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    navigate('/dashboard');
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{group.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {group.destination || 'No destination set'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Create/Join buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleGetStarted('create')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Trip
            </button>
            <button
              onClick={() => handleGetStarted('join')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors backdrop-blur"
            >
              <Users className="w-5 h-5" />
              Join with Code
            </button>
          </div>
        </div>

        {/* Modals */}
        <CreateTripModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTrip}
          loading={loading}
          error={error}
          tripName={tripName}
          setTripName={setTripName}
          destination={destination}
          setDestination={setDestination}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <JoinTripModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSubmit={handleJoinTrip}
          loading={loading}
          error={error}
          inviteCode={inviteCode}
          setInviteCode={setInviteCode}
        />

        <SetupUserModal
          isOpen={showNameModal}
          onClose={() => setShowNameModal(false)}
          onSubmit={handleSetupUser}
          loading={loading}
          error={error}
          userName={userName}
          setUserName={setUserName}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
        />
      </div>
    );
  }

  // New user landing page
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur mb-6">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Plan trips together,<br />travel in sync
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              GroupTrip makes coordinating group travel effortless. Share flights,
              build itineraries, and stay connected with your travel companions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleGetStarted('create')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create a Trip
              </button>
              <button
                onClick={() => handleGetStarted('join')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors backdrop-blur"
              >
                <Users className="w-5 h-5" />
                Join with Code
              </button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="h-16 bg-gray-50" style={{
          clipPath: 'ellipse(70% 100% at 50% 100%)',
          marginTop: '-4rem',
        }} />
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for group travel
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From planning to arrival, GroupTrip keeps everyone on the same page.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: 1, title: 'Create your trip', desc: 'Set up your trip with a name, destination, and dates.' },
              { step: 2, title: 'Invite your group', desc: 'Share the unique invite code with friends and family.' },
              { step: 3, title: 'Add travel details', desc: 'Everyone adds their flights, drives, and accommodations.' },
              { step: 4, title: 'Build the itinerary', desc: 'Collaborate on activities, meals, and meeting points.' },
              { step: 5, title: 'Travel in sync', desc: 'Stay updated with real-time status and notifications.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to plan your next adventure?
          </h2>
          <p className="text-white/80 mb-8">
            Start coordinating your group trip today.
          </p>
          <button
            onClick={() => handleGetStarted('create')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTrip}
        loading={loading}
        error={error}
        tripName={tripName}
        setTripName={setTripName}
        destination={destination}
        setDestination={setDestination}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <JoinTripModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinTrip}
        loading={loading}
        error={error}
        inviteCode={inviteCode}
        setInviteCode={setInviteCode}
      />

      <SetupUserModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSubmit={handleSetupUser}
        loading={loading}
        error={error}
        userName={userName}
        setUserName={setUserName}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
      />
    </div>
  );
}

// Create Trip Modal
function CreateTripModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  tripName,
  setTripName,
  destination,
  setDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Create a New Trip"
      description="Set up your trip details to get started."
      submitText="Create Trip"
      loading={loading}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 text-danger-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="label">Trip Name *</label>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="e.g., Summer Beach Trip"
            className="input"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Miami, Florida"
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="input"
            />
          </div>
        </div>
      </div>
    </FormModal>
  );
}

// Join Trip Modal
function JoinTripModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  inviteCode,
  setInviteCode,
}) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Join a Trip"
      description="Enter the invite code shared by your trip organizer."
      submitText="Join Trip"
      loading={loading}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 text-danger-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="label">Invite Code *</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-character code"
            className="input text-center text-2xl font-mono tracking-widest uppercase"
            maxLength={6}
            autoFocus
          />
          <p className="helper-text">The code is case-insensitive</p>
        </div>
      </div>
    </FormModal>
  );
}

// Setup User Modal
function SetupUserModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
}) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Welcome to GroupTrip!"
      description="Tell us a bit about yourself to get started."
      submitText="Continue"
      loading={loading}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 text-danger-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="label">Your Name *</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="input"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Email (optional)</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="your@email.com"
            className="input"
          />
          <p className="helper-text">Used for notifications and recovery</p>
        </div>
      </div>
    </FormModal>
  );
}
