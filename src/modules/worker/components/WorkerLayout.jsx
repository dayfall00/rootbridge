import React from 'react';
import { Outlet } from 'react-router-dom';
import WorkerSidebar from './WorkerSidebar';
import Navbar from '../../../components/Navbar';

const WorkerLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-text font-body antialiased">
      <WorkerSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WorkerLayout;
