import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ROLES } from '../constants/appConstants';

const ArtisanGuard = ({ children }) => {
  const { userData, loadingUser } = useUser();

  if (loadingUser) return null;
  if (!userData)   return null;

  if (userData.primaryRole !== ROLES.ARTISAN) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ArtisanGuard;
