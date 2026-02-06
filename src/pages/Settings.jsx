import React, { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  Save,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Users,
  Heart,
  MapPin,
  Clock,
  Globe,
  Smartphone,
  Volume2,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useGroup } from '../context/GroupContext';
import { useNotifications } from '../context/NotificationContext';
import { Layout } from '../components/Layout';
import { Avatar } from '../components/Avatar';
import { Modal, FormModal } from '../components/Modal';
import { useConfirmDialog } from '../components/ConfirmDialog';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'display', label: 'Display', icon: Palette },
];

export default function Settings() {
  const { user, preferences, updateUser, updatePreferences, clearUser } = useUser();
  const { currentGroup, leaveGroup } = useGroup();
  const { requestPermission } = useNotifications();
  const { confirm, DialogComponent } = useConfirmDialog();

  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: user?.birthday?.split('T')[0] || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
    emergencyRelationship: user?.emergencyContact?.relationship || '',
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        birthday: profileData.birthday || null,
        emergencyContact: {
          name: profileData.emergencyName,
          phone: profileData.emergencyPhone,
          relationship: profileData.emergencyRelationship,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = async (key) => {
    await updatePreferences({
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key],
      },
    });
  };

  const handleTogglePrivacy = async (key) => {
    await updatePreferences({
      privacy: {
        ...preferences.privacy,
        [key]: !preferences.privacy[key],
      },
    });
  };

  const handleToggleDisplay = async (key, value) => {
    await updatePreferences({
      display: {
        ...preferences.display,
        [key]: value !== undefined ? value : !preferences.display[key],
      },
    });
  };

  const handleRequestNotificationPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      alert('Notifications enabled!');
    } else if (result === 'denied') {
      alert('Notification permission was denied. Please enable it in your browser settings.');
    }
  };

  const handleLeaveTrip = async () => {
    if (!currentGroup) return;

    const confirmed = await confirm({
      title: 'Leave Trip',
      message: `Are you sure you want to leave "${currentGroup.name}"? Your travel details will be removed.`,
      variant: 'danger',
      confirmText: 'Leave Trip',
    });

    if (confirmed) {
      await leaveGroup();
    }
  };

  const handleClearData = async () => {
    const confirmed = await confirm({
      title: 'Clear All Data',
      message: 'This will delete all your data including profile, trips, and preferences. This cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete Everything',
    });

    if (confirmed) {
      await clearUser();
      window.location.reload();
    }
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your profile and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Danger Zone */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 px-4">
                Danger Zone
              </p>
              {currentGroup && (
                <button
                  onClick={handleLeaveTrip}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-danger-600 hover:bg-danger-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Leave Trip</span>
                </button>
              )}
              <button
                onClick={handleClearData}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Clear All Data</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Profile Information</h2>
                </div>
                <div className="card-body space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar name={profileData.name || 'User'} size="xl" />
                    <div>
                      <p className="font-medium text-gray-900">Profile Photo</p>
                      <p className="text-sm text-gray-500">
                        Your initials are shown based on your name
                      </p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="input"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="input"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="input"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div>
                      <label className="label">Birthday</label>
                      <input
                        type="date"
                        value={profileData.birthday}
                        onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                        className="input"
                      />
                      <p className="helper-text">Used for birthday reminders in your group</p>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="pt-6 border-t">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-danger-500" />
                      Emergency Contact
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Contact Name</label>
                        <input
                          type="text"
                          value={profileData.emergencyName}
                          onChange={(e) => setProfileData({ ...profileData, emergencyName: e.target.value })}
                          className="input"
                          placeholder="Contact name"
                        />
                      </div>
                      <div>
                        <label className="label">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.emergencyPhone}
                          onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
                          className="input"
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="label">Relationship</label>
                        <input
                          type="text"
                          value={profileData.emergencyRelationship}
                          onChange={(e) => setProfileData({ ...profileData, emergencyRelationship: e.target.value })}
                          className="input"
                          placeholder="e.g., Spouse, Parent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? (
                        'Saving...'
                      ) : saved ? (
                        <>
                          <Save className="w-4 h-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Notification Preferences</h2>
                </div>
                <div className="card-body space-y-1">
                  {/* Browser Notifications */}
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">Browser Notifications</p>
                          <p className="text-sm text-gray-500">
                            Get push notifications in your browser
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRequestNotificationPermission}
                        className="btn-secondary btn-sm"
                      >
                        Enable
                      </button>
                    </div>
                  </div>

                  <ToggleItem
                    icon={Users}
                    title="Member Updates"
                    description="When members join or leave the trip"
                    enabled={preferences.notifications?.memberChanges}
                    onToggle={() => handleToggleNotification('memberChanges')}
                  />
                  <ToggleItem
                    icon={MapPin}
                    title="Trip Updates"
                    description="Changes to trip details and destinations"
                    enabled={preferences.notifications?.tripUpdates}
                    onToggle={() => handleToggleNotification('tripUpdates')}
                  />
                  <ToggleItem
                    icon={Calendar}
                    title="Itinerary Changes"
                    description="When events are added, updated, or removed"
                    enabled={preferences.notifications?.itineraryChanges}
                    onToggle={() => handleToggleNotification('itineraryChanges')}
                  />
                  <ToggleItem
                    icon={Activity}
                    title="Status Updates"
                    description="When members update their travel status"
                    enabled={preferences.notifications?.statusUpdates}
                    onToggle={() => handleToggleNotification('statusUpdates')}
                  />
                  <ToggleItem
                    icon={Clock}
                    title="24-Hour Reminders"
                    description="Remind me 24 hours before events"
                    enabled={preferences.notifications?.reminders24h}
                    onToggle={() => handleToggleNotification('reminders24h')}
                  />
                  <ToggleItem
                    icon={Bell}
                    title="1-Hour Reminders"
                    description="Remind me 1 hour before events"
                    enabled={preferences.notifications?.reminders1h}
                    onToggle={() => handleToggleNotification('reminders1h')}
                  />
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Privacy Settings</h2>
                </div>
                <div className="card-body space-y-1">
                  <ToggleItem
                    icon={MapPin}
                    title="Share Location"
                    description="Allow group members to see your location (when enabled)"
                    enabled={preferences.privacy?.shareLocation}
                    onToggle={() => handleTogglePrivacy('shareLocation')}
                  />
                  <ToggleItem
                    icon={Mail}
                    title="Show Email"
                    description="Display your email to group members"
                    enabled={preferences.privacy?.showEmail}
                    onToggle={() => handleTogglePrivacy('showEmail')}
                  />
                  <ToggleItem
                    icon={Phone}
                    title="Show Phone Number"
                    description="Display your phone number to group members"
                    enabled={preferences.privacy?.showPhone}
                    onToggle={() => handleTogglePrivacy('showPhone')}
                  />

                  <div className="pt-6 mt-6 border-t">
                    <div className="flex items-start gap-3 p-4 bg-warning-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-warning-800">Privacy Notice</p>
                        <p className="text-sm text-warning-700 mt-1">
                          Your travel details (flights, accommodations) are always visible to
                          group members to help coordinate the trip. Adjust the settings above
                          to control what personal contact information is shared.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Display Section */}
            {activeSection === 'display' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Display Preferences</h2>
                </div>
                <div className="card-body space-y-1">
                  <ToggleItem
                    icon={Globe}
                    title="Show Timezones"
                    description="Display timezone information for flights and events"
                    enabled={preferences.display?.showTimezones}
                    onToggle={() => handleToggleDisplay('showTimezones')}
                  />
                  <ToggleItem
                    icon={Clock}
                    title="24-Hour Time"
                    description="Use 24-hour time format instead of AM/PM"
                    enabled={preferences.display?.use24HourTime}
                    onToggle={() => handleToggleDisplay('use24HourTime')}
                  />
                  <ToggleItem
                    icon={Eye}
                    title="Compact View"
                    description="Show more items with less spacing"
                    enabled={preferences.display?.compactView}
                    onToggle={() => handleToggleDisplay('compactView')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogComponent />
    </Layout>
  );
}

// Toggle Item Component
function ToggleItem({ icon: Icon, title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
