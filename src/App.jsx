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
import WorkerProfile from './modules/worker/pages/WorkerProfile';

<<<<<<< HEAD
// Shopkeeper Modules
import ShopkeeperLayout from './modules/shopkeeper/components/ShopkeeperLayout';
import ShopkeeperDashboard from './modules/shopkeeper/pages/ShopkeeperDashboard';
import PostHelperJob from './modules/shopkeeper/pages/PostHelperJob';
import MyJobPosts from './modules/shopkeeper/pages/MyJobPosts';
import ShopkeeperProfile from './modules/shopkeeper/pages/ShopkeeperProfile';
=======
// Artisan Modules
import ArtisanLayout from './modules/artisan/components/ArtisanLayout';
import ArtisanDashboard from './modules/artisan/pages/ArtisanDashboard';
import AddProduct from './modules/artisan/pages/AddProduct';
import MyProducts from './modules/artisan/pages/MyProducts';
>>>>>>> 3a7d5b87acc17a7a4727a465e903bd201e8d5b9d

// Guard
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import RootRedirect from './components/RootRedirect';
import WorkerGuard from './components/WorkerGuard';
import ShopkeeperGuard from './components/ShopkeeperGuard';
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
              <Route path="profile" element={<WorkerProfile />} />
            </Route>

<<<<<<< HEAD
            {/* Shopkeeper Module Routes */}
            <Route path="/shopkeeper" element={<ProtectedRoute><ShopkeeperGuard><ShopkeeperLayout /></ShopkeeperGuard></ProtectedRoute>}>
              <Route index element={<ShopkeeperDashboard />} />
              <Route path="post-job" element={<PostHelperJob />} />
              <Route path="my-jobs" element={<MyJobPosts />} />
              <Route path="profile" element={<ShopkeeperProfile />} />
=======
            {/* Artisan Module Routes */}
            <Route path="/artisan" element={<ProtectedRoute><ArtisanLayout /></ProtectedRoute>}>
              <Route index element={<ArtisanDashboard />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="my-products" element={<MyProducts />} />
>>>>>>> 3a7d5b87acc17a7a4727a465e903bd201e8d5b9d
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
