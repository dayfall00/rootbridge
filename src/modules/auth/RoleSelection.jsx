import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserRoles } from '../../services/userService';
import { createOrUpdateWorker } from '../../services/workerService';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { Search, Handshake, Store, Building2, CheckCircle2, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ROLES = {
  customer: {
    id: 'customer',
    titleKey: 'auth.roles.customer_title',
    descKey: 'auth.roles.customer_desc',
    Icon: Search,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
    activeBorder: 'border-primary'
  },
  worker: {
    id: 'worker',
    titleKey: 'auth.roles.worker_title',
    descKey: 'auth.roles.worker_desc',
    Icon: Handshake,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/20',
    activeBorder: 'border-primary'
  },
  artisan: {
    id: 'artisan',
    titleKey: 'auth.roles.artisan_title',
    descKey: 'auth.roles.artisan_desc',
    Icon: Store,
    colorClass: 'text-tertiary',
    bgClass: 'bg-tertiary/10',
    activeBorder: 'border-tertiary'
  },
  business: {
    id: 'business',
    titleKey: 'auth.roles.business_title',
    descKey: 'auth.roles.business_desc',
    Icon: Building2,
    colorClass: 'text-secondary',
    bgClass: 'bg-secondary/10',
    activeBorder: 'border-secondary'
  },
  shopkeeper: {
    id: 'shopkeeper',
    titleKey: 'auth.roles.shopkeeper_title',
    descKey: 'auth.roles.shopkeeper_desc',
    Icon: Store,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    activeBorder: 'border-amber-400'
  }
};

const RoleSelection = () => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const { userData } = useUser();
  const navigate = useNavigate();

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const primaryRole = selectedRole;
      await updateUserRoles(currentUser.uid, [selectedRole], primaryRole);

      // Explicit Check: If worker, create worker document
      if (selectedRole === 'worker') {
        await createOrUpdateWorker(currentUser.uid, {
          category: null, 
          city: userData?.city || null
        });
      }

      // Shopkeeper: navigate directly to shopkeeper portal
      if (selectedRole === 'shopkeeper') {
        navigate('/onboarding/profile');
        return;
      }

      navigate('/onboarding/profile');
    } catch (err) {
      console.error(err);
      setError('Failed to save roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-text min-h-screen flex flex-col items-center">
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="text-xl font-bold tracking-tight text-primary font-headline">RootBridge</div>
          <nav className="hidden md:flex items-center gap-8">
            <span className="font-headline text-sm font-semibold text-gray-500 transition-colors">Identity</span>
            <span className="font-headline text-sm font-bold text-primary transition-colors">Role</span>
            <span className="font-headline text-sm font-semibold text-gray-500 transition-colors">Profile</span>
          </nav>
        </div>
      </header>

      <main className="w-full flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-[600px]">
          <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="relative z-10">
              <div className="mb-10 text-center">
                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">Step 2 of 4</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-text font-headline leading-tight">
                  {t('auth.role_title')}
                </h1>
                <p className="text-gray-500 text-sm mt-3 font-body">{t('auth.role_subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(ROLES).map((role) => {
                  const isSelected = selectedRole === role.id;
                  const Icon = role.Icon;
                  const StatusIcon = isSelected ? CheckCircle2 : PlusCircle;
                  return (
                    <div 
                      key={role.id}
                      onClick={() => !loading && handleSelectRole(role.id)}
                      className={`group relative cursor-pointer flex flex-col p-5 bg-white rounded-xl transition-all border-2 ${isSelected ? role.activeBorder : 'border-gray-100 hover:border-gray-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-lg ${role.bgClass} flex items-center justify-center mb-4 ${role.colorClass} group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="font-headline font-bold text-lg text-text">{t(role.titleKey)}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t(role.descKey)}</p>
                      
                      <div className={`mt-4 flex items-center text-[10px] font-bold uppercase tracking-wider ${role.colorClass} ${isSelected ? '' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        {isSelected ? t('auth.selected') : t('auth.select')} 
                        <StatusIcon size={14} className="ml-1" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && <p className="text-error text-sm mt-6 font-medium text-center">{error}</p>}

              <div className="mt-12 flex flex-col gap-4">
                <button 
                  onClick={handleContinue}
                  className={`w-full py-4 bg-primary text-white font-headline font-bold rounded-xl transition-opacity ${loading || !selectedRole ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}`}
                  disabled={loading || !selectedRole}
                >
                  {loading ? t('auth.saving') : t('auth.continue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleSelection;
