import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  Plane,
  Bell,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Plus,
  MapPin,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useGroup } from '../context/GroupContext';
import { useNotifications } from '../context/NotificationContext';
import { Avatar } from './Avatar';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/itinerary', label: 'Itinerary', icon: Calendar },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/travel', label: 'My Travel', icon: Plane },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userName } = useUser();
  const { currentGroup, groups, switchGroup } = useGroup();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);

  const handleGroupSwitch = (groupId) => {
    switchGroup(groupId);
    setGroupMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">GroupTrip</span>
          </Link>

          <Link to="/notifications" className="relative p-2 -mr-2 text-gray-600 hover:text-gray-900">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GroupTrip</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Group selector */}
          {currentGroup && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="relative">
                <button
                  onClick={() => setGroupMenuOpen(!groupMenuOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {currentGroup.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentGroup.destination || 'No destination set'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${groupMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {groupMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupSwitch(group.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                          group.id === currentGroup.id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{group.name}</span>
                      </button>
                    ))}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          setGroupMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-primary-600"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">New Trip</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const showBadge = item.path === '/notifications' && unreadCount > 0;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {showBadge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-danger-500 text-white rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar name={userName} size="md" status={user?.status} showStatus />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'Guest'}</p>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-72 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const showBadge = item.path === '/notifications' && unreadCount > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full relative ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {showBadge && (
                  <span className="absolute top-1.5 right-1/4 w-4 h-4 text-[10px] font-bold bg-danger-500 text-white rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Simple layout without navigation (for landing page, onboarding)
export function SimpleLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

// Auth layout with centered content
export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}
          {subtitle && <p className="text-white/80 mt-2">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
