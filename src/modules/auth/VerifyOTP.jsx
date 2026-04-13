import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP } from '../../services/authService';
import { createUserIfNotExists } from '../../services/userService';
import { Unlock, ShieldCheck } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || 'Unknown';
  
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ''); // only digits
    if (!value) {
      // Handle backspace or empty
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // get last char
    setOtp(newOtp);

    // Auto focus next
    if (index < 5 && value) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await verifyOTP(otpString);
      
      // EXPLICIT LOGIC: After OTP verification
      // Check Firestore "users" collection using uid
      // If user does NOT exist: -> create initial user document
      // If user exists: -> return existing doc
      const userDoc = await createUserIfNotExists(user.uid, user.phoneNumber || user.email || 'Unknown');

      if (!userDoc.primaryRole) {
        navigate('/onboarding/role');
      } else if (!userDoc.name) {
        navigate('/onboarding/profile');
      } else {
        navigate('/redirect');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-text min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b border-gray-100">
        <div className="text-xl font-headline font-bold tracking-tight text-primary">RootBridge</div>
        <div className="hidden md:flex items-center gap-6">
          <span className="text-gray-500 text-sm font-label uppercase tracking-widest opacity-50">Secure Verification</span>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-2xl shadow-sm flex flex-col items-center">
          <div className="mb-8 w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-primary border border-gray-100">
            <Unlock size={32} />
          </div>

          <div className="text-center mb-10">
            <h1 className="font-headline text-3xl font-bold text-text tracking-tight mb-2">Enter OTP</h1>
            <p className="font-body text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto">
              We sent a code to {phoneNumber}. Please enter the 6-digit verification code below.
            </p>
          </div>

          <div className="flex justify-between w-full gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                className="w-12 h-14 text-center text-xl font-bold rounded-lg bg-white border border-gray-200 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                maxLength="1"
                placeholder="•"
                type="tel"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={loading}
              />
            ))}
          </div>
          
          {error && <p className="text-error text-xs mb-6 font-medium text-center">{error}</p>}

          <div className="w-full space-y-6 mt-6">
            <button 
              onClick={handleVerify}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl bg-primary text-white font-headline font-bold text-lg transition-opacity ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-label text-gray-500 uppercase tracking-tighter">Didn't receive a code?</p>
              <button 
                className="text-secondary font-semibold text-sm hover:underline decoration-2 underline-offset-4 transition-all active:scale-95"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Go back & Resend OTP
              </button>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-2 text-gray-400">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-label uppercase tracking-[0.2em]">Secure Encryption Active</span>
          </div>
        </div>

        <div className="mt-12 text-center opacity-60 select-none">
          <p className="text-xs text-gray-500">Secure login session encrypted with 256-bit AES</p>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTP;
