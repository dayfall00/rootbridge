import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { ROLE_HOME, ROUTES } from '../constants/routes';

/**
 * RootRedirect — mounted at "/redirect"
 * After login/OTP, all auth flows navigate here.
 * Decides the correct dashboard based on primaryRole.
 *
 *  Not logged in  → Landing page "/"
 *  Logged in, no role → Onboarding
 *  Logged in, has role → Role dashboard
 */
const RootRedirect = () => {
  const { currentUser, loading }    = useAuth();
  const { userData, loadingUser }   = useUser();

  // Wait for Firebase auth to initialise
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not authenticated → back to landing page
  if (!currentUser) return <Navigate to={ROUTES.LANDING} replace />;

  // Still loading user doc
  if (loadingUser) return null;

  // User needs to complete onboarding
  if (!userData?.primaryRole) return <Navigate to={ROUTES.ONBOARDING_ROLE}    replace />;
  if (!userData?.name)        return <Navigate to={ROUTES.ONBOARDING_PROFILE} replace />;

  // Route to the correct role dashboard
  const destination = ROLE_HOME[userData.primaryRole] ?? ROUTES.HOME;
  return <Navigate to={destination} replace />;
};

export default RootRedirect;
