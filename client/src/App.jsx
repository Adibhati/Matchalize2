import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AppConfigProvider } from './utils/AppConfigContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Splash from './pages/Splash';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Auth Guard for Protected Routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('matchalize_token');
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// Check if user is already onboarded
const OnboardingRoute = ({ children }) => {
  const userStr = localStorage.getItem('matchalize_user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (user && user.isOnboarded) {
    return <Navigate to="/discover" replace />;
  }
  return children;
};

function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
      <AppConfigProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Splash />} />
          <Route path="/auth" element={<Auth />} />

          {/* Onboarding Guard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingRoute>
                  <Onboarding />
                </OnboardingRoute>
              </ProtectedRoute>
            }
          />

          {/* Protected Main Routes */}
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:matchId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
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

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </AppConfigProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
