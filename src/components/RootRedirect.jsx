import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const RootRedirect = () => {
  const { currentUser, loading } = useAuth();
  const { userData, loadingUser } = useUser();

  // Debug logging (temporary)
  console.log("User role:", userData?.primaryRole);

  // Show spinner while auth / user data is resolving
  if (loading || (currentUser && loadingUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Do NOT redirect until userData is available
  if (!userData) return null;

  // Role-based redirects
  if (userData.primaryRole === 'worker') {
    return <Navigate to="/worker" replace />;
  }

  if (userData.primaryRole === 'artisan') {
    return <Navigate to="/artisan" replace />;
  }

  if (userData.primaryRole === 'shopkeeper') {
    return <Navigate to="/shopkeeper" replace />;
  }

  // Default: customer / any other role
  return <Navigate to="/home" replace />;
};

export default RootRedirect;
