import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const { userData, loadingUser } = useUser();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we're authenticated but still loading the firestore doc, show a loading state
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If authenticated but user document does not exist, and not on OTP page (where it's created),
  // they need to complete verification, but since verifyOTP creates it, this assumes
  // they just finished. The /otp page creates it immediately.

  // Render children normally
  return children;
};

export default ProtectedRoute;
