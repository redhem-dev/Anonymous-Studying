import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import SingleTicket from './pages/SingleTicket';
import SearchResults from './pages/SearchResults';
import GoogleSignIn from './components/GoogleSignIn';
import SetUsername from './pages/SetUsername';
import useAuth from './hooks/useAuth';
import './App.css';

// Loading component for better user experience
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-6"></div>
      <p className="text-gray-700 text-lg font-medium">Loading...</p>
    </div>
  </div>
);

// Standalone ProtectedRoute component
const ProtectedRoute = ({ children, isAuthenticated, isLoading, tempUser }) => {
  // Show loading indicator while checking auth
  if (isLoading) {
    return <Loading />;
  }

  // If we have a temporary user (Google auth but no username yet), redirect to username setup
  if (tempUser) {
    const email = tempUser.email || '';
    const encodedEmail = encodeURIComponent(email);
    return <Navigate to={`/set-username?email=${encodedEmail}`} replace />;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Fully authenticated user, render the requested route
  return children;
};

function App() {
  const { isAuthenticated, isLoading, tempUser, refreshAuth } = useAuth();

  // Force auth check on app mount
  React.useEffect(() => {
    refreshAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated && !tempUser ? 
            <Navigate to="/dashboard" replace /> : 
            <GoogleSignIn />
        } />
        
        <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />
        
        {/* Set username route - redirect to dashboard if already authenticated */}
        <Route 
          path="/set-username" 
          element={
            isAuthenticated && !tempUser ? 
              <Navigate to="/dashboard" replace /> : 
              <SetUsername />
          } 
        />
        
        {/* Root redirect */}
        <Route path="/" element={
          isLoading ? 
            <Loading /> : 
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} tempUser={tempUser}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/account" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} tempUser={tempUser}>
              <Account />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/ticket/:ticketId" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} tempUser={tempUser}>
              <SingleTicket />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/search" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} tempUser={tempUser}>
              <SearchResults />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
