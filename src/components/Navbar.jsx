import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { logout } = useAuth();
  const { userData } = useUser();
  const navigate = useNavigate();

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
            placeholder="Search workers or products" 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/profile" className="p-1 rounded-full hover:bg-gray-100 transition-colors scale-95 duration-150 ease-in-out">
          {userData?.avatar ? (
            <img src={userData.avatar} alt="User Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 py-2 px-4 rounded-full bg-gray-100 hover:bg-tertiary/10 text-tertiary transition-colors font-medium text-sm">
          <LogOut size={20} className="text-tertiary" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
