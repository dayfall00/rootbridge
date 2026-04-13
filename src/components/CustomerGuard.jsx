import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ROLES } from '../constants/appConstants';
import { ROLE_HOME } from '../constants/routes';

const CustomerGuard = ({ children }) => {
  const { userData, loadingUser } = useUser();

  if (loadingUser) return null;
  if (!userData)   return null;

  const role = userData.primaryRole;

  // Only customers (and unset roles) access the customer layout.
  // Every other role is redirected to their module home.
  if (role === ROLES.WORKER || role === ROLES.ARTISAN || role === ROLES.BUSINESS || role === ROLES.SHOPKEEPER) {
    return <Navigate to={ROLE_HOME[role]} replace />;
  }

  return children;
};

export default CustomerGuard;
