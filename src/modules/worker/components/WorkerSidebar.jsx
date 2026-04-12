import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Home, ClipboardList, Briefcase, User } from 'lucide-react';

const WorkerSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const getNavClass = ({ isActive }) => {
    const baseClass = `flex items-center py-3 font-medium transition-all duration-200 rounded-lg ${collapsed ? 'justify-center px-0' : 'px-4 gap-3 translate-x-1'}`;
    if (isActive) {
      return `${baseClass} text-primary font-bold bg-gray-50`;
    }
    return `${baseClass} text-gray-500 hover:text-primary`;
  };

  return (
    <aside className={`border-r border-gray-200 bg-white flex flex-col py-8 gap-y-4 shrink-0 transition-all duration-300 ${collapsed ? "w-20 px-2" : "w-64 px-6"}`}>
      <div className={`flex items-start mb-8 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-2xl font-black text-primary font-headline">RootBridge</h1>
            <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Worker Dashboard</p>
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
        <NavLink to="/worker" end className={getNavClass}>
          <Home size={20} className="shrink-0" />
          {!collapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Dashboard</span>}
        </NavLink>
        <NavLink to="/worker/jobs" className={getNavClass}>
          <ClipboardList size={20} className="shrink-0" />
          {!collapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Available Jobs</span>}
        </NavLink>
        <NavLink to="/worker/my-jobs" className={getNavClass}>
          <Briefcase size={20} className="shrink-0" />
          {!collapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">My Jobs</span>}
        </NavLink>
        <NavLink to="/worker/profile" className={getNavClass}>
          <User size={20} className="shrink-0" />
          {!collapsed && <span className="font-headline text-sm ml-1 whitespace-nowrap">Profile</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default WorkerSidebar;
