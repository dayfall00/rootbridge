import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, initRecaptcha, signInWithGoogle } from '../../services/authService';
import { createUserIfNotExists } from '../../services/userService';
import { Network, Phone, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      
      // Navigate cleanly
      // UserContext will handle creation, but we want to know current state to navigate
      // So we fetch/create it once manually for navigation purposes.
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
      setError(err.message || 'Failed to login with Google.');
    }
  };

  useEffect(() => {
    setTimeout(() => {
      initRecaptcha();
    }, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter a valid phone number.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await sendOTP(phoneNumber);
      // Pass the cleaned phone number to OTP screen for resend logic if needed
      navigate('/otp', { state: { phoneNumber } });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-text min-h-screen flex flex-col selection:bg-primary/20 selection:text-text">
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        
        <div className="w-full max-w-[480px] z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Network className="text-white" size={24} />
              </div>
              <span className="font-headline text-2xl font-extrabold tracking-tight text-text">RootBridge</span>
            </div>
            <p className="font-label text-sm text-gray-500 tracking-wide uppercase">Find workers. Get work. Sell products.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100">
            <h1 className="font-headline text-3xl font-bold text-text mb-2">{t('auth.login_title')}</h1>
            <p className="text-gray-500 mb-8 font-body">{t('auth.login_subtitle')}</p>
            
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">{t('auth.phone_label')}</label>
                <div className="relative flex items-center group">
                  <div className="absolute left-4 flex items-center gap-2 pointer-events-none">
                    <Phone className="text-gray-500" size={18} />
                    <span className="text-text font-medium border-r border-gray-200 pr-2 mr-1">+91</span>
                  </div>
                  <input 
                    className="w-full pl-24 pr-4 py-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-text placeholder:text-gray-400" 
                    placeholder="98765 43210" 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    required
                  />
                </div>
                {error && <p className="text-error text-xs ml-1 mt-1 font-medium">{error}</p>}
              </div>
              
              <button 
                id="sign-in-button"
                className={`w-full py-4 px-6 bg-primary text-white font-headline font-bold rounded-xl transition-opacity ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}`} 
                type="submit"
                disabled={loading}
              >
                {loading ? t('auth.sending') : t('auth.send_otp')}
              </button>
              
              {/* Invisible reCAPTCHA container required by Firebase */}
              <div id="recaptcha-container"></div>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-500 uppercase tracking-widest text-[10px]">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-4 px-6 border border-gray-300 bg-white text-text font-headline font-bold rounded-xl shadow-sm flex items-center justify-center gap-3 transition-colors hover:bg-gray-50 active:scale-[0.98]"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-start gap-3">
              <div className="mt-0.5">
                <ShieldCheck className="text-primary" size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text">Secure login via OTP.</p>
                <p className="text-xs text-gray-500 leading-relaxed">No password required. We'll send a 6-digit code to verify your identity.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-6">
            <a className="text-xs font-semibold text-secondary hover:text-blue-600 transition-colors uppercase tracking-wider" href="#">New User? Join Us</a>
            <span className="text-gray-300">•</span>
            <a className="text-xs font-semibold text-gray-500 hover:text-text transition-colors uppercase tracking-wider" href="#">Privacy Policy</a>
          </div>
        </div>
      </main>
      
      <div className="hidden lg:block fixed right-12 bottom-12 max-w-xs text-right opacity-30">
        <h2 className="font-headline text-4xl font-black text-gray-400 uppercase leading-none mb-2">Connect.<br/>Create.<br/>Deliver.</h2>
        <p className="text-xs font-label text-gray-500">The RootBridge Professional Ecosystem © 2024</p>
      </div>
    </div>
  );
};

export default Login;
