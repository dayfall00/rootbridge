import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ShopkeeperGuard = ({ children }) => {
  const { userData, loadingUser } = useUser();

  if (loadingUser) return null;
  if (!userData)   return null;

  const roles = userData.roles || [];
  const isShopkeeper =
    userData.primaryRole === 'shopkeeper' || roles.includes('shopkeeper');

  if (!isShopkeeper) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ShopkeeperGuard;
