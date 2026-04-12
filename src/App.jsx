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

// Worker Modules
import WorkerDashboard from './modules/worker/pages/WorkerDashboard';
import AvailableJobs from './modules/worker/pages/AvailableJobs';
import MyJobs from './modules/worker/pages/MyJobs';

// Guard
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import RootRedirect from './components/RootRedirect';
import WorkerGuard from './components/WorkerGuard';
import CustomerGuard from './components/CustomerGuard';
import WorkerLayout from './modules/worker/components/WorkerLayout';

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
            <Route element={<ProtectedRoute><CustomerGuard><Layout /></CustomerGuard></ProtectedRoute>}>
              <Route path="/home" element={<Home />} />
              <Route path="/services" element={<ServicesMarketplace />} />
              <Route path="/shop" element={<ArtisanShop />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            {/* Worker Module Routes */}
            <Route path="/worker" element={<ProtectedRoute><WorkerGuard><WorkerLayout /></WorkerGuard></ProtectedRoute>}>
              <Route index element={<WorkerDashboard />} />
              <Route path="jobs" element={<AvailableJobs />} />
              <Route path="my-jobs" element={<MyJobs />} />
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
