import React from 'react';
import { useUser } from '../context/UserContext';
import Layout from './Layout';
import WorkerLayout from '../modules/worker/components/WorkerLayout';
import ArtisanLayout from '../modules/artisan/components/ArtisanLayout';
import ShopkeeperLayout from '../modules/shopkeeper/components/ShopkeeperLayout';

/**
 * RoleBasedLayout — single source of truth for layout selection.
 * Used as a reference / utility. The primary routing remains in App.jsx
 * with per-role guards for security.
 */
const RoleBasedLayout = () => {
  const { userData, loadingUser } = useUser();

  if (loadingUser || !userData) return null;

  console.log('ROLE:', userData.primaryRole);

  switch (userData.primaryRole) {
    case 'worker':
      console.log('Rendering Worker Layout');
      return <WorkerLayout />;

    case 'artisan':
      console.log('Rendering Artisan Layout');
      return <ArtisanLayout />;

    case 'shopkeeper':
    case 'business':
      console.log('Rendering Shopkeeper Layout');
      return <ShopkeeperLayout />;

    default:
      console.log('Rendering Customer Layout');
      return <Layout />;
  }
};

export default RoleBasedLayout;
