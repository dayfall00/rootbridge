import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { db } from '../../../services/firebase';
import {
  collection, query, where, onSnapshot, getDocs,
} from 'firebase/firestore';
import {
  MapPin, Phone, Star, IndianRupee, Clock,
  CalendarDays, Briefcase, User,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  open:      { label: 'Open',      cls: 'bg-green-100 text-green-700' },
  assigned:  { label: 'Assigned',  cls: 'bg-blue-100  text-blue-700'  },
  completed: { label: 'Completed', cls: 'bg-gray-100  text-gray-600'  },
};

const fmt = (n) =>
  typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '₹—';

// ── Component ─────────────────────────────────────────────────────────────────
const ShopkeeperProfile = () => {
  const { currentUser }           = useAuth();
  const { userData, loadingUser } = useUser();

  const [jobs,       setJobs]      = useState([]);
  const [avgRating,  setAvgRating] = useState(null);  // null = not yet fetched
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loadingJobs, setLoadingJobs]   = useState(true);

  // ── Phase 1: Subscribe to own helper jobs ─────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'jobs'),
      where('postedBy',  '==', currentUser.uid),
      where('jobType',   '==', 'helper')
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const jobList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // newest first
      jobList.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setJobs(jobList);
      setLoadingJobs(false);

      // ── Phase 2: Fetch reviews for all job IDs ──────────────────────────
      if (jobList.length === 0) {
        setAvgRating(0);
        setReviewsCount(0);
        return;
      }

      const jobIds = jobList.map(j => j.id);

      // Firestore "in" query max 30 items; chunk if needed
      const CHUNK = 30;
      let allRatings = [];
      for (let i = 0; i < jobIds.length; i += CHUNK) {
        const chunk = jobIds.slice(i, i + CHUNK);
        const rq    = query(
          collection(db, 'reviews'),
          where('jobId', 'in', chunk)
        );
        const rSnap = await getDocs(rq);
        rSnap.forEach(d => {
          const r = d.data().rating;
          if (typeof r === 'number') allRatings.push(r);
        });
      }

      setReviewsCount(allRatings.length);
      setAvgRating(
        allRatings.length > 0
          ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length
          : 0
      );
    });

    return () => unsub();
  }, [currentUser?.uid]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingUser || loadingJobs) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    open:      jobs.filter(j => j.status === 'open').length,
    assigned:  jobs.filter(j => j.status === 'assigned').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Profile Card ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <User size={36} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-text mb-1">
            {userData?.name || 'Shopkeeper'}
          </h1>
          <span className="inline-block text-xs font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full mb-3 capitalize">
            Shopkeeper
          </span>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {userData?.city && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                <span className="capitalize">{userData.city}</span>
              </span>
            )}
            {userData?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="text-primary" />
                {userData.phone}
              </span>
            )}
          </div>
        </div>

        {/* Rating Widget */}
        <div className="shrink-0 text-center bg-gray-50 rounded-2xl p-4 min-w-[110px] border border-gray-100">
          {avgRating === null ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          ) : reviewsCount === 0 ? (
            <>
              <p className="text-xs text-gray-400 font-semibold">Rating</p>
              <p className="text-xs text-gray-400 mt-1">No ratings yet</p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 font-semibold mb-1">Avg Rating</p>
              <div className="flex items-center justify-center gap-1">
                <Star size={16} fill="currentColor" className="text-amber-400" />
                <span className="text-xl font-black text-text">{avgRating.toFixed(1)}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">/ 5 · {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}</p>
            </>
          )}
        </div>
      </section>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open',      count: stats.open,      bg: 'bg-green-50', text: 'text-green-700' },
          { label: 'Assigned',  count: stats.assigned,  bg: 'bg-blue-50',  text: 'text-blue-700'  },
          { label: 'Completed', count: stats.completed, bg: 'bg-gray-50',  text: 'text-gray-600'  },
        ].map(({ label, count, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-black ${text}`}>{count}</p>
            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </section>

      {/* ── Posted Jobs ──────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-primary" />
          Job Posts ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-gray-600 font-semibold">No jobs posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const s = STATUS_STYLE[job.status] || STATUS_STYLE.open;
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3"
                >
                  {/* Title + Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-text">{job.title}</h3>
                      <p className="text-primary text-sm font-semibold capitalize">{job.category} Shop</p>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full capitalize shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  {/* Description */}
                  {job.description && (
                    <p className="text-sm text-gray-500 leading-relaxed">{job.description}</p>
                  )}

                  {/* Meta */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <IndianRupee size={14} className="text-primary shrink-0" />
                      {fmt(job.budget)}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock size={14} className="text-primary shrink-0" />
                      {job.workDuration || '—'}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <CalendarDays size={14} className="text-primary shrink-0" />
                      {job.workingHours || '—'}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin size={14} className="text-primary shrink-0" />
                      <span className="capitalize">{job.city || '—'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};

export default ShopkeeperProfile;
