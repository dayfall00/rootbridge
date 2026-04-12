import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const CustomerGuard = ({ children }) => {
  const { userData, loadingUser } = useUser();

  if (loadingUser) {
    return null; // ProtectedRoute will handle the loading spinner
  }

  if (!userData) return null;

  // Protect customer routes from being accessed by workers
  if (userData.primaryRole === 'worker') {
    return <Navigate to="/worker" replace />;
  }

  return children;
};

export default CustomerGuard;
