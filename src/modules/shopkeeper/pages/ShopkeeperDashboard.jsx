import React, { useEffect, useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { useAuth } from '../../../context/AuthContext';
import { subscribeToShopkeeperJobs } from '../../../services/jobService';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, ClipboardList, CheckCircle, Clock,
  MapPin, IndianRupee, TrendingUp,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  open:      { label: 'Open',                 cls: 'bg-green-100 text-green-700' },
  assigned:  { label: 'Assigned',             cls: 'bg-blue-100  text-blue-700'  },
  pending:   { label: 'Pending Confirmation', cls: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed',            cls: 'bg-gray-100  text-gray-600'  },
};

/** Resolve display status accounting for completionRequested flag. */
const resolveStatus = (job) => {
  if (job.status === 'completed') return STATUS_STYLE.completed;
  if (job.completionRequested)   return STATUS_STYLE.pending;
  return STATUS_STYLE[job.status] || STATUS_STYLE.open;
};

const fmt = (n) =>
  typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '₹—';

// ── Component ─────────────────────────────────────────────────────────────────
const ShopkeeperDashboard = () => {
  const { userData, loadingUser } = useUser();
  const { currentUser }           = useAuth();
  const navigate                  = useNavigate();

  const [allJobs,  setAllJobs]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  // ── Firestore: real-time subscription ────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsub = subscribeToShopkeeperJobs(currentUser.uid, (jobs) => {
      // newest first
      jobs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setAllJobs(jobs);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = {
    open:      allJobs.filter(j => j.status === 'open').length,
    // Count both "assigned" and "pending confirmation" in the Assigned bucket
    assigned:  allJobs.filter(j => j.status === 'assigned').length,
    completed: allJobs.filter(j => j.status === 'completed').length,
  };
  const recentJobs = allJobs.slice(0, 3);

  // ── Loading guard ─────────────────────────────────────────────────────────
  if (loadingUser || loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Welcome Banner */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text mb-1">
            Welcome, {userData?.name || 'Shopkeeper'} 👋
          </h1>
          <p className="text-gray-500">
            Post helper job requirements and manage your listings.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/shopkeeper/post-job')}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shrink-0"
        >
          <PlusCircle size={18} />
          Post Helper Job
        </button>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: 'Open Posts',
            count: stats.open,
            icon:  <ClipboardList size={26} />,
            bg:    'bg-green-50',
            text:  'text-green-600',
          },
          {
            label: 'Assigned',
            count: stats.assigned,
            icon:  <Clock size={26} />,
            bg:    'bg-blue-50',
            text:  'text-blue-600',
          },
          {
            label: 'Completed',
            count: stats.completed,
            icon:  <CheckCircle size={26} />,
            bg:    'bg-gray-100',
            text:  'text-gray-600',
          },
        ].map(({ label, count, icon, bg, text }) => (
          <div
            key={label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                {label}
              </p>
              <h2 className="text-4xl font-black text-text">{count}</h2>
            </div>
            <div className={`p-4 ${bg} rounded-2xl ${text}`}>{icon}</div>
          </div>
        ))}
      </section>

      {/* Recent Jobs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-text flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Recent Job Posts
          </h3>
          {allJobs.length > 3 && (
            <button
              onClick={() => navigate('/shopkeeper/my-jobs')}
              className="text-sm text-primary font-semibold hover:underline"
            >
              View all →
            </button>
          )}
        </div>

        {recentJobs.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-gray-600 font-semibold">No jobs posted yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Click "Post Helper Job" to create your first listing.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map(job => {
              const s = resolveStatus(job);
              return (
                <div
                  key={job.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  {/* Left: title + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text truncate">{job.title}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <IndianRupee size={12} className="text-primary" />
                        {fmt(job.budget)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-primary" />
                        <span className="capitalize">{job.city || '—'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: status badge */}
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full capitalize shrink-0 ${s.cls}`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="text-xl font-bold text-text mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/shopkeeper/post-job')}
            className="flex items-start text-left gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
              <PlusCircle size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-text mb-1 group-hover:text-primary transition-colors">
                Post a Helper Job
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Create a new requirement and reach helpers in your city.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/shopkeeper/my-jobs')}
            className="flex items-start text-left gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors shrink-0">
              <ClipboardList size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-text mb-1 group-hover:text-green-600 transition-colors">
                View All Job Posts
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Track status, review details, and manage every listing.
              </p>
            </div>
          </button>
        </div>
      </section>

    </div>
  );
};

export default ShopkeeperDashboard;
