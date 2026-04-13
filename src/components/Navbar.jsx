import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { ROLE_PROFILE, ROUTES } from '../constants/routes';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { userData } = useUser();
  const navigate = useNavigate();

  // Role-aware profile link — uses centralized ROLE_PROFILE map from routes.js
  const profilePath = ROLE_PROFILE[userData?.primaryRole] ?? ROUTES.PROFILE;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  return (
    <header className="h-16 bg-white flex justify-between items-center px-8 shrink-0 z-40 border-b border-gray-200">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text placeholder:text-gray-400" 
            placeholder={t('navbar.search_placeholder')}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link to={profilePath} className="p-1 rounded-full hover:bg-gray-100 transition-colors scale-95 duration-150 ease-in-out">
          {userData?.profileImage || userData?.avatar ? (
            <img
              src={userData.profileImage || userData.avatar}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white select-none">
              {userData?.name ? userData.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
          )}
        </Link>

        {/* Language Switcher */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg shrink-0">
          <Globe size={16} className="text-gray-500" />
          <select 
            value={i18n. भाषा || i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-transparent border-none text-sm font-semibold text-gray-700 outline-none cursor-pointer focus:ring-0 appearance-none pr-4"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.2rem top 55%", backgroundSize: "0.65rem auto" }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 py-2 px-4 rounded-full bg-gray-100 hover:bg-tertiary/10 text-tertiary transition-colors font-medium text-sm shrink-0">
          <LogOut size={20} className="text-tertiary" />
          {t('navbar.logout')}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
