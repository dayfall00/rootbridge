import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, LayoutDashboard, PlusCircle, ClipboardList, User } from 'lucide-react';

const ShopkeeperSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const getNavClass = ({ isActive }) => {
    const base = `flex items-center py-3 font-medium transition-all duration-200 rounded-lg ${
      collapsed ? 'justify-center px-0' : 'px-4 gap-3 translate-x-1'
    }`;
    return isActive
      ? `${base} text-primary font-bold bg-gray-50`
      : `${base} text-gray-500 hover:text-primary`;
  };

  return (
    <aside
      className={`border-r border-gray-200 bg-white flex flex-col py-8 gap-y-4 shrink-0 transition-all duration-300 ${
        collapsed ? 'w-20 px-2' : 'w-64 px-6'
      }`}
    >
      <div className={`flex items-start mb-8 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-2xl font-black text-primary font-headline">RootBridge</h1>
            <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Shopkeeper Portal</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex flex-col gap-y-2">
        <NavLink to="/business" end className={getNavClass}>
          <LayoutDashboard size={20} className="shrink-0" />
          {!collapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Dashboard</span>}
        </NavLink>
        <NavLink to="/business/post-job" className={getNavClass}>
          <PlusCircle size={20} className="shrink-0" />
          {!collapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Post Helper Job</span>}
        </NavLink>
        <NavLink to="/business/my-jobs" className={getNavClass}>
          <ClipboardList size={20} className="shrink-0" />
          {!collapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">My Job Posts</span>}
        </NavLink>
        <NavLink to="/business/profile" className={getNavClass}>
          <User size={20} className="shrink-0" />
          {!collapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Profile</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default ShopkeeperSidebar;
