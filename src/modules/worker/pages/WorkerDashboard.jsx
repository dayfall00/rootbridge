import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { db } from '../../../services/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { toggleAvailability } from '../../../services/workerService';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle } from 'lucide-react';

const WorkerDashboard = () => {
  const { currentUser } = useAuth();
  const { userData, loadingUser } = useUser();
  const navigate = useNavigate();

  const [isAvailable, setIsAvailable] = useState(false);
  const [stats, setStats] = useState({ active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  // Firestore Subscriptions
  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubWorker = null;
    let unsubJobs = null;

    // 1. Worker Availability Subscription
    const workerRef = doc(db, 'workers', currentUser.uid);
    unsubWorker = onSnapshot(workerRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsAvailable(docSnap.data().isAvailable || false);
      }
    });

    // 2. Jobs Quick Stats Subscription
    const jobsRef = collection(db, 'jobs');
    const qJobs = query(jobsRef, where('assignedTo', '==', currentUser.uid));
    
    unsubJobs = onSnapshot(qJobs, (snapshot) => {
      let activeCount = 0;
      let completedCount = 0;
      
      snapshot.forEach(jobDoc => {
        const job = jobDoc.data();
        if (job.status === 'completed') {
          completedCount++;
        } else if (
          job.status === 'assigned' ||
          job.status === 'in_progress' ||
          job.completionRequested  // pending confirmation counts as "active"
        ) {
          activeCount++;
        }
      });

      setStats({ active: activeCount, completed: completedCount });
      setLoading(false);
    });

    return () => {
      if (unsubWorker) unsubWorker();
      if (unsubJobs) unsubJobs();
    };
  }, [currentUser]);

  const handleToggleAvailability = async () => {
    if (!currentUser?.uid) return;
    try {
      const newStatus = !isAvailable;
      // Optimistic update
      setIsAvailable(newStatus);
      await toggleAvailability(currentUser.uid, newStatus);
    } catch (error) {
      console.error("Failed to update availability:", error);
      // Revert on failure
      setIsAvailable(!isAvailable);
    }
  };

  if (loadingUser || loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse text-gray-400 font-medium">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Toggle Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-text mb-1">
            Welcome back, {userData?.name || 'Worker'}
          </h1>
          <p className="text-gray-500">Manage your jobs and availability directly from your dashboard.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <span className="text-sm font-bold text-gray-600">Available for work</span>
          <button 
            type="button"
            onClick={handleToggleAvailability}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isAvailable ? 'bg-primary' : 'bg-gray-300'}`}
            role="switch"
            aria-checked={isAvailable}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Active Jobs</p>
            <h2 className="text-4xl font-black text-text">{stats.active}</h2>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Clock size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Completed</p>
            <h2 className="text-4xl font-black text-text">{stats.completed}</h2>
          </div>
          <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
            <CheckCircle size={32} />
          </div>
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section>
        <h3 className="text-xl font-bold text-text mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => navigate('/worker/jobs')}
            className="flex items-start text-left gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Briefcase size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-text mb-1 group-hover:text-primary transition-colors">Available Jobs</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Browse and accept new job requests from customers in your area.</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/worker/my-jobs')}
            className="flex items-start text-left gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-secondary/30 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
              <CheckCircle size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-text mb-1 group-hover:text-secondary transition-colors">My Jobs</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Manage your currently active assignments and view your past completed jobs.</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default WorkerDashboard;
