import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { registerWithEmail, signInWithGoogle } from '../../services/authService';
import { createUserIfNotExists } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { Network, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

// ── Validation helpers ──────────────────────────────────────────────────────
const validateEmail = (v) => {
  if (!v) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Invalid email format.';
  return '';
};
const validatePassword = (v) => {
  if (!v) return 'Password is required.';
  if (v.length < 6) return 'Password must be at least 6 characters.';
  return '';
};
const validateConfirm = (pass, confirm) => {
  if (!confirm) return 'Please confirm your password.';
  if (pass !== confirm) return 'Passwords do not match.';
  return '';
};

// ── Firebase error → friendly message ───────────────────────────────────────
const mapFirebaseError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Invalid email format.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    default:
      return 'Registration failed. Please try again.';
  }
};

const Register = () => {
  const { currentUser } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');

  const [emailErr, setEmailErr]     = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [confirmErr, setConfirmErr] = useState('');
  const [error, setError]           = useState('');

  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

  const navigate = useNavigate();

  // Already logged-in users go straight to their dashboard
  if (currentUser) return <Navigate to="/redirect" replace />;

  // ── Shared post-auth navigation ────────────────────────────────────────────
  const handlePostAuth = async (user) => {
    const userDoc = await createUserIfNotExists(user.uid, user.email || 'Unknown');
    if (!userDoc.primaryRole) {
      navigate('/onboarding/role');
    } else if (!userDoc.name) {
      navigate('/onboarding/profile');
    } else {
      navigate('/redirect');
    }
  };

  // ── Email + Password registration ──────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validateConfirm(password, confirm);
    setEmailErr(eErr);
    setPasswordErr(pErr);
    setConfirmErr(cErr);
    if (eErr || pErr || cErr) return;

    setLoading(true);
    setError('');

    try {
      const user = await registerWithEmail(email, password);
      await handlePostAuth(user);
    } catch (err) {
      console.error(err);
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-up ─────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      await handlePostAuth(user);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign up with Google.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validateConfirm(password, confirm);

  return (
    <div className="bg-background font-body text-text min-h-screen flex flex-col selection:bg-primary/20 selection:text-text">
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">

        <div className="w-full max-w-[480px] z-10">

          {/* ── Brand ── */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Network className="text-white" size={24} />
              </div>
              <span className="font-headline text-2xl font-extrabold tracking-tight text-text">RootBridge</span>
            </div>
            <p className="font-label text-sm text-gray-500 tracking-wide uppercase">Find workers. Get work. Sell products.</p>
          </div>

          {/* ── Card ── */}
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100">
            <h1 className="font-headline text-3xl font-bold text-text mb-2">Create account</h1>
            <p className="text-gray-500 mb-8 font-body">Sign up to get started with RootBridge.</p>

            <form className="space-y-6" onSubmit={handleRegister} noValidate>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">
                  Email
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    disabled={loading}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailErr(validateEmail(e.target.value));
                      setError('');
                    }}
                    className={`w-full pl-11 pr-4 py-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-text placeholder:text-gray-400 ${emailErr ? 'border-red-400' : 'border-gray-200'}`}
                  />
                </div>
                {emailErr && <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{emailErr}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="register-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={password}
                    disabled={loading}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordErr(validatePassword(e.target.value));
                      if (confirm) setConfirmErr(validateConfirm(e.target.value, confirm));
                      setError('');
                    }}
                    className={`w-full pl-11 pr-12 py-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-text placeholder:text-gray-400 ${passwordErr ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErr && <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{passwordErr}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="register-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirm}
                    disabled={loading}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setConfirmErr(validateConfirm(password, e.target.value));
                      setError('');
                    }}
                    className={`w-full pl-11 pr-12 py-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-text placeholder:text-gray-400 ${confirmErr ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmErr && <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{confirmErr}</p>}
              </div>

              {/* Server error */}
              {error && (
                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
              )}

              {/* Submit */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full py-4 px-6 bg-primary text-white font-headline font-bold rounded-xl transition-opacity ${loading || !isFormValid ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}`}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Google */}
              <button
                type="button"
                id="google-register-button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full py-4 px-6 border border-gray-300 bg-white text-text font-headline font-bold rounded-xl shadow-sm flex items-center justify-center gap-3 transition-colors hover:bg-gray-50 active:scale-[0.98] ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>

            </form>

            {/* Security badge */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-start gap-3">
              <div className="mt-0.5">
                <ShieldCheck className="text-primary" size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text">Your data is safe with us.</p>
                <p className="text-xs text-gray-500 leading-relaxed">We use industry-standard encryption to protect your account.</p>
              </div>
            </div>
          </div>

          {/* Footer nav */}
          <div className="mt-8 flex justify-center gap-6">
            <Link
              to="/login"
              className="text-xs font-semibold text-secondary hover:text-blue-600 transition-colors uppercase tracking-wider"
            >
              Already have an account? Login
            </Link>
            <span className="text-gray-300">•</span>
            <a className="text-xs font-semibold text-gray-500 hover:text-text transition-colors uppercase tracking-wider" href="#">Privacy Policy</a>
          </div>
        </div>
      </main>

      {/* Background watermark */}
      <div className="hidden lg:block fixed right-12 bottom-12 max-w-xs text-right opacity-30">
        <h2 className="font-headline text-4xl font-black text-gray-400 uppercase leading-none mb-2">Connect.<br/>Create.<br/>Deliver.</h2>
        <p className="text-xs font-label text-gray-500">The RootBridge Professional Ecosystem © 2024</p>
      </div>
    </div>
  );
};

export default Register;
