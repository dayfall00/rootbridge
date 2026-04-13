import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ROLES } from '../constants/appConstants';
import { ROUTES } from '../constants/routes';

const ShopkeeperGuard = ({ children }) => {
  const { userData, loadingUser } = useUser();

  if (loadingUser) return null;
  if (!userData)   return null;

  const roles = userData.roles || [];
  const role  = userData.primaryRole;

  const isAllowed =
    role === ROLES.SHOPKEEPER || roles.includes(ROLES.SHOPKEEPER) ||
    role === ROLES.BUSINESS   || roles.includes(ROLES.BUSINESS);

  if (!isAllowed) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default ShopkeeperGuard;
