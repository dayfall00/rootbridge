import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const RootRedirect = () => {
  const { currentUser, loading } = useAuth();
  const { userData, loadingUser } = useUser();

  // TASK 5: DEBUG LOGGING (TEMPORARY)
  console.log("User role:", userData?.primaryRole);

  // TASK 1: IF loading: -> return loading UI
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

  // TASK 3: Do NOT redirect until userData is available
  if (!userData) return null;

  // TASK 1: IF userData.primaryRole === "worker": -> navigate("/worker")
  if (userData.primaryRole === 'worker') {
    return <Navigate to="/worker" replace />;
  }

<<<<<<< HEAD
  if (userData.primaryRole === 'artisan') {
    return <Navigate to="/artisan" replace />;
  }

=======
  // Shopkeeper portal redirect
  if (userData.primaryRole === "shopkeeper") {
    return <Navigate to="/shopkeeper" replace />;
  }

  // ELSE: -> navigate("/home")
>>>>>>> 28bba3e (add shopkeeper module and update services)
  return <Navigate to="/home" replace />;
};

export default RootRedirect;
