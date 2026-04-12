import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

// Auth & Onboarding Modules
import Login from './modules/auth/Login';
import VerifyOTP from './modules/auth/VerifyOTP';
import RoleSelection from './modules/auth/RoleSelection';
import ProfileSetup from './modules/auth/ProfileSetup';

// Main Application Modules
import Home from './modules/discovery/Home';
import ServicesMarketplace from './modules/discovery/ServicesMarketplace';
import ArtisanShop from './modules/marketplace/ArtisanShop';
import UserProfile from './modules/profile/UserProfile';

// Guard
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const RootRedirect = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface">Loading application...</div>;
  }
  
  return currentUser ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            
            {/* Protected Onboarding Routes */}
            <Route 
              path="/onboarding/role" 
              element={
                <ProtectedRoute>
                  <RoleSelection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding/profile" 
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />

            {/* Protected Main Discovery Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/home" element={<Home />} />
              <Route path="/services" element={<ServicesMarketplace />} />
              <Route path="/shop" element={<ArtisanShop />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
