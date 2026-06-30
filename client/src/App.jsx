import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

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

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.12 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Routes location={location}>
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
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
      <AppConfigProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
      </AppConfigProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
