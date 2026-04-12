import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { subscribeToShopkeeperJobs, confirmJobCompletion, rejectJobCompletion } from '../../../services/jobService';
import {
  MapPin, Clock, IndianRupee, Phone,
  CalendarDays, CheckCircle2, XCircle, Hourglass,
} from 'lucide-react';

// ── Status badge styles ────────────────────────────────────────────────────
const STATUS_BADGE = {
  open:      'bg-green-100 text-green-700',
  assigned:  'bg-blue-100  text-blue-700',
  completed: 'bg-gray-100  text-gray-600',
  pending:   'bg-amber-100 text-amber-700',
};

// ── Helper: resolve the display status label + style ──────────────────────
const resolveStatus = (job) => {
  if (job.status === 'completed') return { label: 'Completed', key: 'completed' };
  if (job.completionRequested)   return { label: 'Pending Confirmation', key: 'pending' };
  return { label: job.status, key: job.status };
};

// ── Confirm / Reject action button ────────────────────────────────────────
const ActionButton = ({ onClick, disabled, variant, children }) => {
  const base    = 'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed';
  const styles  = {
    confirm: 'bg-green-600 text-white hover:opacity-90',
    reject:  'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const MyJobPosts = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(null);  // jobId being actioned
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToShopkeeperJobs(currentUser.uid, (data) => {
      data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setJobs(data);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  // ── Confirm completion ─────────────────────────────────────────────────
  const handleConfirm = async (jobId) => {
    try {
      setError('');
      setActing(jobId);
      await confirmJobCompletion(jobId);
    } catch (e) {
      console.error('Confirm failed:', e);
      setError('Failed to confirm completion. Please try again.');
    } finally {
      setActing(null);
    }
  };

  // ── Reject completion ──────────────────────────────────────────────────
  const handleReject = async (jobId) => {
    try {
      setError('');
      setActing(jobId);
      await rejectJobCompletion(jobId);
    } catch (e) {
      console.error('Reject failed:', e);
      setError('Failed to reject completion. Please try again.');
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text mb-1">My Job Posts</h1>
        <p className="text-gray-500">
          {jobs.length} helper job{jobs.length !== 1 ? 's' : ''} posted by you.
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">{error}</div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-600 font-semibold">No job posts yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Go to "Post Helper Job" to create your first listing.
          </p>
        </div>
      )}

      {/* Job cards */}
      {jobs.map(job => {
        const { label, key } = resolveStatus(job);
        const isActing       = acting === job.id;

        return (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
          >
            {/* Title + Status */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-text">{job.title}</h2>
                <p className="text-primary text-sm font-semibold capitalize mt-0.5">
                  {job.category} Shop
                </p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full capitalize shrink-0 ${
                  STATUS_BADGE[key] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Description */}
            {job.description && (
              <p className="text-gray-500 text-sm leading-relaxed">{job.description}</p>
            )}

            {/* ── Completion confirmation panel ────────────────────────────────── */}
            {job.completionRequested && job.status !== 'completed' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-start gap-2">
                  <Hourglass size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-amber-800 font-semibold text-sm">
                      This job was marked as completed by the worker.
                    </p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      Please confirm or reject. If no action is taken within 48 hours,
                      the job will be auto-completed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <ActionButton
                    variant="confirm"
                    onClick={() => handleConfirm(job.id)}
                    disabled={isActing}
                  >
                    <CheckCircle2 size={15} />
                    Confirm Completion
                  </ActionButton>
                  <ActionButton
                    variant="reject"
                    onClick={() => handleReject(job.id)}
                    disabled={isActing}
                  >
                    <XCircle size={15} />
                    Reject
                  </ActionButton>
                </div>
              </div>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <IndianRupee size={15} className="text-primary shrink-0" />
                <span>₹{job.budget?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock size={15} className="text-primary shrink-0" />
                <span>{job.workDuration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <CalendarDays size={15} className="text-primary shrink-0" />
                <span>{job.workingHours}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin size={15} className="text-primary shrink-0" />
                <span className="capitalize">{job.city}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2 text-gray-500 text-sm border-t border-gray-50 pt-3">
              <Phone size={14} className="shrink-0" />
              <a href={`tel:${job.contactNumber}`} className="hover:text-primary transition-colors">
                {job.contactNumber}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyJobPosts;
