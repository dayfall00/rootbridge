import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { User, UserCheck, Users, IdCard, CheckCircle2, ShieldCheck, MapPin, ArrowRight, Shield, Zap } from 'lucide-react';

const ProfileSetup = () => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFinishSetup = async (e) => {
    e.preventDefault();
    if (!name || !city) {
      setError('Please fill in both name and city.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateUserProfile(currentUser.uid, { name, city });
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-text min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary font-headline">RootBridge</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8">
            <span className="font-manrope text-sm font-semibold text-gray-500">Identity</span>
            <span className="font-manrope text-sm font-semibold text-gray-500">Role</span>
            <span className="font-manrope text-sm font-semibold text-gray-500">Profile</span>
            <span className="font-manrope text-sm font-bold text-primary">Complete</span>
          </nav>
          <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
            <User size={16} className="text-gray-500" />
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 pt-20">
        <aside className="hidden md:flex flex-col py-8 h-full w-64 bg-white border-r border-gray-200">
          <div className="px-8 mb-10">
            <h2 className="font-inter text-xs uppercase tracking-wider text-gray-500">Onboarding</h2>
            <p className="text-primary font-bold text-sm">Step 2 of 2</p>
          </div>
          <nav className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-8 py-3 text-gray-500 transition-all duration-300 opacity-50">
              <UserCheck size={20} />
              <span className="font-inter text-xs uppercase tracking-wider">Identity</span>
            </div>
            <div className="flex items-center gap-3 px-8 py-3 text-gray-500 transition-all duration-300 opacity-50">
              <Users size={20} />
              <span className="font-inter text-xs uppercase tracking-wider">Role</span>
            </div>
            <div className="flex items-center gap-3 px-8 py-3 text-gray-500 transition-all duration-300 opacity-50">
              <IdCard size={20} />
              <span className="font-inter text-xs uppercase tracking-wider">Profile</span>
            </div>
            <div className="flex items-center gap-3 px-8 py-3 text-primary border-r-2 border-primary font-bold bg-primary/5 transition-all duration-300">
              <CheckCircle2 size={20} />
              <span className="font-inter text-xs uppercase tracking-wider">Complete</span>
            </div>
          </nav>
        </aside>
        
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          
          <div className="bg-white border border-gray-100 w-full max-w-lg rounded-2xl p-10 z-10 relative shadow-sm">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-headline font-extrabold text-text mb-2 tracking-tight">Complete your profile</h1>
              <p className="text-gray-500 font-medium text-sm">Step 2 of 2 — Finalizing your presence</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleFinishSetup}>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest px-1" htmlFor="full_name">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input 
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text placeholder:text-gray-400 transition-all duration-200" 
                    id="full_name" 
                    name="full_name" 
                    placeholder="Johnathan Doe" 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest px-1" htmlFor="city">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <input 
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text placeholder:text-gray-400 transition-all duration-200" 
                    id="city" 
                    name="city" 
                    placeholder="San Francisco, CA" 
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <p className="text-error text-xs font-medium">{error}</p>}
              
              <div className="pt-6">
                <button 
                  className={`w-full py-4 px-6 bg-primary text-white font-headline font-bold text-lg rounded-xl transition-opacity flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}`} 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Finish Setup'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </div>
              
              <p className="text-center text-xs text-gray-500 pt-4">
                By clicking finish, you agree to our 
                <a className="text-secondary font-semibold hover:underline ml-1" href="#">Terms of Service</a>
              </p>
            </form>
          </div>
          
          <div className="mt-12 flex gap-12 text-gray-400 hidden md:flex">
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span className="text-xs font-medium">Secure Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} />
              <span className="text-xs font-medium">Instant Verification</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSetup;
