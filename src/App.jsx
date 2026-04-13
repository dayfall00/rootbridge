import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

// Public
const LandingPage = lazy(() => import('./modules/landing/LandingPage'));

// Auth & Onboarding
import Login        from './modules/auth/Login';
import VerifyOTP    from './modules/auth/VerifyOTP';
import RoleSelection from './modules/auth/RoleSelection';
import ProfileSetup  from './modules/auth/ProfileSetup';

// Customer Module
import Home               from './modules/discovery/Home';
import ServicesMarketplace from './modules/discovery/ServicesMarketplace';
import ArtisanShop        from './modules/marketplace/ArtisanShop';
import UserProfile        from './modules/profile/UserProfile';

// Worker Module
import WorkerDashboard from './modules/worker/pages/WorkerDashboard';
import AvailableJobs   from './modules/worker/pages/AvailableJobs';
import MyJobs          from './modules/worker/pages/MyJobs';
import WorkerProfile   from './modules/worker/pages/WorkerProfile';

// Shopkeeper Module
import ShopkeeperLayout   from './modules/shopkeeper/components/ShopkeeperLayout';
import ShopkeeperDashboard from './modules/shopkeeper/pages/ShopkeeperDashboard';
import PostHelperJob       from './modules/shopkeeper/pages/PostHelperJob';
import MyJobPosts          from './modules/shopkeeper/pages/MyJobPosts';
import ShopkeeperProfile   from './modules/shopkeeper/pages/ShopkeeperProfile';

// Artisan Module
import ArtisanLayout   from './modules/artisan/components/ArtisanLayout';
import ArtisanDashboard from './modules/artisan/pages/ArtisanDashboard';
import AddProduct       from './modules/artisan/pages/AddProduct';
import MyProducts       from './modules/artisan/pages/MyProducts';
import ArtisanProfile   from './modules/artisan/pages/ArtisanProfile';

// Guards & Layouts
import ProtectedRoute  from './components/ProtectedRoute';
import Layout          from './components/Layout';
import WorkerLayout    from './modules/worker/components/WorkerLayout';
import RootRedirect    from './components/RootRedirect';
import WorkerGuard     from './components/WorkerGuard';
import ShopkeeperGuard from './components/ShopkeeperGuard';
import ArtisanGuard    from './components/ArtisanGuard';
import CustomerGuard   from './components/CustomerGuard';

// Minimal fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Routes>

            {/* ── Public ───────────────────────────────────────────────── */}
            <Route
              path="/"
              element={
                <Suspense fallback={<PageLoader />}>
                  <LandingPage />
                </Suspense>
              }
            />
            <Route path="/login"       element={<Login />}       />
            <Route path="/verify-otp"  element={<VerifyOTP />}   />

            {/* Post-login smart redirect (used by Login & VerifyOTP) */}
            <Route path="/redirect" element={<RootRedirect />} />

            {/* ── Protected Onboarding ─────────────────────────────────── */}
            <Route path="/onboarding/role"    element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
            <Route path="/onboarding/profile" element={<ProtectedRoute><ProfileSetup  /></ProtectedRoute>} />

            {/* ── Customer Module ───────────────────────────────────────── */}
            <Route element={<ProtectedRoute><CustomerGuard><Layout /></CustomerGuard></ProtectedRoute>}>
              <Route path="/home"     element={<Home />}               />
              <Route path="/services" element={<ServicesMarketplace />} />
              <Route path="/shop"     element={<ArtisanShop />}         />
              <Route path="/profile"  element={<UserProfile />}         />
            </Route>

            {/* ── Worker Module ─────────────────────────────────────────── */}
            <Route path="/worker" element={<ProtectedRoute><WorkerGuard><WorkerLayout /></WorkerGuard></ProtectedRoute>}>
              <Route index           element={<WorkerDashboard />} />
              <Route path="jobs"     element={<AvailableJobs />}    />
              <Route path="my-jobs"  element={<MyJobs />}           />
              <Route path="profile"  element={<WorkerProfile />}    />
            </Route>

            {/* ── Business / Shopkeeper Module ──────────────────────────── */}
            <Route path="/business" element={<ProtectedRoute><ShopkeeperGuard><ShopkeeperLayout /></ShopkeeperGuard></ProtectedRoute>}>
              <Route index            element={<ShopkeeperDashboard />} />
              <Route path="post-job"  element={<PostHelperJob />}       />
              <Route path="my-jobs"   element={<MyJobPosts />}          />
              <Route path="profile"   element={<ShopkeeperProfile />}   />
            </Route>

            {/* ── Artisan Module ────────────────────────────────────────── */}
            <Route path="/artisan" element={<ProtectedRoute><ArtisanGuard><ArtisanLayout /></ArtisanGuard></ProtectedRoute>}>
              <Route index               element={<ArtisanDashboard />} />
              <Route path="add-product"  element={<AddProduct />}       />
              <Route path="products"     element={<MyProducts />}        />
              <Route path="profile"      element={<ArtisanProfile />}   />
            </Route>

            {/* ── Catch-all ─────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
