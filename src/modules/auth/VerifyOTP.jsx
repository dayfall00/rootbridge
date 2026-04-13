import React from 'react';
import { Navigate } from 'react-router-dom';

// Phone OTP auth has been removed. Redirect any accidental visits to login.
const VerifyOTP = () => <Navigate to="/login" replace />;

export default VerifyOTP;
