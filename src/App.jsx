import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { GroupProvider, useGroup } from './context/GroupContext';
import { NotificationProvider } from './context/NotificationContext';
import { LoadingPage } from './components/LoadingSpinner';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TravelDetails from './pages/TravelDetails';
import Itinerary from './pages/Itinerary';
import Members from './pages/Members';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { loading: userLoading } = useUser();
  const { loading: groupLoading, currentGroup } = useGroup();

  if (userLoading || groupLoading) {
    return <LoadingPage />;
  }

  // If no current group, redirect to landing
  if (!currentGroup) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// App Routes
function AppRoutes() {
  const { loading: userLoading } = useUser();
  const { loading: groupLoading } = useGroup();

  if (userLoading || groupLoading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/travel"
        element={
          <ProtectedRoute>
            <TravelDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/itinerary"
        element={
          <ProtectedRoute>
            <Itinerary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
function App() {
  return (
    <UserProvider>
      <GroupProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </GroupProvider>
    </UserProvider>
  );
}

export default App;
