import React from 'react';
import { useUser } from '../../context/UserContext';
import { Phone, BadgeCheck, HardHat, TreePine, TrendingUp } from 'lucide-react';

const UserProfile = () => {
  const { userData, primaryRole, setPrimaryRole } = useUser();
  const displayName = userData?.name || 'RootBridge User';
  const displayPhone = userData?.phone || '+1 (555) 829-1024';
  
  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* Profile Header Block */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img alt="User avatar" className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-gray-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiA4cAqcaPKCQS9RnfMBUu-Q_ZUp0Snxm1HcSfHj1tmVwVpWhHAMtODoGn18CAsnLnc7PMowiLl8a4Ga_zQRi5PeCo395GKevrnb-K0pmssFpTvFGUvL8UKcbDUnwLobRhHeamC1CXbuWir0P7hklU9mwtbPeGL_ncmRntJdC9UBtUJgYzuV145qx6ZGX28qylhCHwN17hcmN6zr8usmqRuxlC8J6k9CMGcAWDerc5d5njh_OilCUh3MfWZhGZLDFj7pN96f3wPZ4" />
            <div className="absolute -bottom-2 -right-2 bg-secondary p-1.5 rounded-lg border-2 border-white">
              <BadgeCheck className="text-white" size={16} />
            </div>
          </div>
          <div>
            <h2 className="font-headline text-4xl font-extrabold text-text tracking-tight">{displayName}</h2>
            <p className="font-body text-gray-500 flex items-center gap-2 mt-1">
              <Phone size={14} /> {displayPhone}
            </p>
          </div>
        </div>

        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center shadow-inner">
          {userData?.roles?.map((role) => (
            <button 
              key={role}
              onClick={() => setPrimaryRole(role)}
              className={`px-6 py-2 rounded-lg text-sm transition-all capitalize ${primaryRole === role ? 'font-bold bg-white text-primary shadow-sm' : 'font-semibold text-gray-500 hover:text-text'}`}
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      {/* Dashboard Grid Placeholder / Visuals */}
      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl font-bold text-text">My Jobs</h3>
              <div className="flex gap-4">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">ACTIVE: 2</span>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">HISTORY: 48</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <HardHat size={24} />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-text">Terrace Greenhouse Installation</h4>
                    <p className="text-xs text-gray-500">Client: Sarah Kensington • Expected Completion Dec 12</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">$1,240.00</p>
                  <span className="text-[10px] font-bold uppercase text-amber-600">IN PROGRESS</span>
                </div>
              </div>
              
              <div className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                    <TreePine size={24} />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-text">Bonsai Tree Rehabilitation</h4>
                    <p className="text-xs text-gray-500">Client: Marcus Vane • Completed Nov 28</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text">$450.00</p>
                  <span className="text-[10px] font-bold uppercase text-gray-400">COMPLETED</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-headline text-xl font-bold mb-6 px-2 text-text">Featured Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group hover:-translate-y-1 transition-all">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img alt="product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdFjj11B9FrTQBklvllIJoTyMrxU83v-n2UaFsBnNqCQWS4em_QaDn8OZe5csSStHRusO0Y-ABCmQW8FyhticoRQcv1i-tJ2rlBHYYdyJ5sOu__gc9hgrjKICKs3ZTS3J1jf4-BYbwsNnIAM85NaJAbYLqC5AmiYqISlEFYN9-FF9Slrgyr9u5cWUqtPK1W1LzgKJOPcXyUJaO04wZwQn42pzTezbFSJQp2OdpzNHpq7iN0RsYFqs_WCXD4OgA1cwoWaR3QzMTTdk" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold shadow-sm">$85</div>
                </div>
                <div className="p-5">
                  <h4 className="font-headline font-bold text-sm text-text">Monolith Concrete Planter</h4>
                  <p className="text-xs text-gray-500 mt-1">12 Sales this month</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group hover:-translate-y-1 transition-all">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img alt="product 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWsDZfokB7yW9y_RgAar5v5BdUScnEv_zQiIDtHZVYAM1KLZ0wX5cm3-Bj7biZDAU3USPWcd0JU1j-M1gNQTbzMqpNaTtpUy59D5MRLpGnbNHzOq1jiE_C9wmP067qOgc4dmtwHfrvQZx33LWpMBLCbUphnVjm_A_3klC3m8LwNo1y4mI11uTJPCJ898KsQ3ycjBWVSA4LMTBaXb_8Va9obfzbhpgYrlOvN8Y97Hf9R0Py-a99eLfB8aEps44ZUIlV8K6kFxYMchU" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold shadow-sm">$120</div>
                </div>
                <div className="p-5">
                  <h4 className="font-headline font-bold text-sm text-text">Heritage Copper Trowel</h4>
                  <p className="text-xs text-gray-500 mt-1">4 Sales this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-primary rounded-2xl p-8 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Earnings</p>
            <h3 className="font-headline text-4xl font-extrabold mb-8">$14,820.50</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/20 pb-4">
                <div>
                  <p className="text-[10px] opacity-70">This Month</p>
                  <p className="font-bold text-lg">+$3,400.00</p>
                </div>
                <TrendingUp className="text-white/80" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] opacity-70">Available for Payout</p>
                  <p className="font-bold text-lg">$890.15</p>
                </div>
                <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-black shadow-md hover:bg-gray-50 transition-colors">WITHDRAW</button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-headline text-lg font-bold mb-6 text-text">Trust Score</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <span className="font-headline font-black text-primary text-xl">98</span>
              </div>
              <div>
                <p className="text-sm font-bold text-text">Top 2% Globally</p>
                <p className="text-xs text-gray-500">Based on 52 verified client reviews</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">Punctuality</span>
                <div className="flex-1 ml-4 h-1.5 bg-gray-100 rounded-full">
                  <div className="bg-primary h-full rounded-full w-[100%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">Craftsmanship</span>
                <div className="flex-1 ml-4 h-1.5 bg-gray-100 rounded-full">
                  <div className="bg-primary h-full rounded-full w-[95%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">Communication</span>
                <div className="flex-1 ml-4 h-1.5 bg-gray-100 rounded-full">
                  <div className="bg-primary h-full rounded-full w-[98%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
