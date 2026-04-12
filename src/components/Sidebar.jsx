import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Wrench, ShoppingBag, User, Menu } from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavClass = ({ isActive }) => {
    const baseClass = `flex items-center gap-3 py-3 font-medium transition-all duration-200 rounded-lg ${isCollapsed ? 'justify-center mx-2 px-0' : 'px-4 translate-x-1'}`;
    if (isActive) {
      return `${baseClass} text-primary font-bold bg-gray-50`;
    }
    return `${baseClass} text-gray-500 hover:text-primary`;
  };

  return (
    <aside className={`${isCollapsed ? 'w-20 px-2' : 'w-64 px-6'} transition-all duration-300 ease-in-out border-r border-gray-200 bg-white flex flex-col py-6 gap-y-2 shrink-0 overflow-hidden`}>
      <div className={`flex items-center mb-2 mt-2 ${isCollapsed ? 'justify-center pl-0' : 'justify-between pl-2'}`}>
        {!isCollapsed && (
          <h1 className="text-2xl font-black text-primary font-headline whitespace-nowrap overflow-hidden">RootBridge</h1>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50"
        >
          <Menu size={24} />
        </button>
      </div>

      {!isCollapsed && (
        <p className="text-xs text-gray-500 font-medium -mt-2 mb-8 pl-2 whitespace-nowrap transition-opacity duration-300">The Architectural Greenhouse</p>
      )}

      <nav className={`flex flex-col gap-y-2 ${isCollapsed ? 'mt-10' : ''}`}>
        <NavLink to="/home" className={getNavClass}>
          <Home size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Home</span>}
        </NavLink>
        <NavLink to="/services" className={getNavClass}>
          <Wrench size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Services</span>}
        </NavLink>
        <NavLink to="/shop" className={getNavClass}>
          <ShoppingBag size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Shop</span>}
        </NavLink>
        <NavLink to="/profile" className={getNavClass}>
          <User size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Profile</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
