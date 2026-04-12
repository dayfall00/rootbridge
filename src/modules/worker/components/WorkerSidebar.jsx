import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Briefcase } from 'lucide-react';

const WorkerSidebar = () => {
  const getNavClass = ({ isActive }) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 rounded-lg translate-x-1";
    if (isActive) {
      return `${baseClass} text-primary font-bold bg-gray-50`;
    }
    return `${baseClass} text-gray-500 hover:text-primary`;
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col py-8 px-6 gap-y-4 shrink-0">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-primary font-headline">RootBridge</h1>
        <p className="text-xs text-gray-500 font-medium">Worker Dashboard</p>
      </div>
      <nav className="flex flex-col gap-y-2">
        <NavLink to="/worker" end className={getNavClass}>
          <Home size={20} />
          <span className="font-headline text-sm ml-1">Dashboard</span>
        </NavLink>
        <NavLink to="/worker/jobs" className={getNavClass}>
          <ClipboardList size={20} />
          <span className="font-headline text-sm ml-1">Available Jobs</span>
        </NavLink>
        <NavLink to="/worker/my-jobs" className={getNavClass}>
          <Briefcase size={20} />
          <span className="font-headline text-sm ml-1">My Jobs</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default WorkerSidebar;
