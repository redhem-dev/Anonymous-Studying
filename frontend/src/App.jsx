import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import SingleTicket from './pages/SingleTicket';
import GoogleSignIn from './components/GoogleSignIn';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/status', {
          credentials: 'include', // Important for cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Auth-protected route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<GoogleSignIn />} />
        <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ticket/:ticketId" 
          element={
            <ProtectedRoute>
              <SingleTicket />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
