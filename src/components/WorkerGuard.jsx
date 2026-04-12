import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const WorkerGuard = ({ children }) => {
  const { userData, loadingUser } = useUser();

  if (loadingUser) {
    return null; // ProtectedRoute will handle the loading spinner
  }

  // TASK 3: Do NOT redirect until userData is available
  if (!userData) return null;

  // TASK 4: PROTECT WORKER ROUTES - Ensure /worker routes only accessible if userData.primaryRole === "worker", Else redirect to /home
  if (userData.primaryRole !== 'worker') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default WorkerGuard;
