import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchMyJobs, requestJobCompletion, forceCompleteJob } from '../../../services/workerService';
import JobCard from '../components/JobCard';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AUTO_COMPLETE_MS = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

const MyJobs = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [activeJobs, setActiveJobs]       = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [completing, setCompleting]       = useState(null); // jobId currently being processed

  // ── Real-time job subscription + frontend auto-complete check ──────────────
  useEffect(() => {
    let unsubscribe;
    if (!currentUser?.uid) return;

    unsubscribe = fetchMyJobs(currentUser.uid, async (fetchedJobs) => {
      const active    = [];
      const completed = [];
      const now       = Date.now();

      for (const job of fetchedJobs) {
        if (job.status === 'completed') {
          completed.push(job);
          continue;
        }

        // ── Frontend auto-completion fallback ──────────────────────────────
        // If worker requested completion > 48 h ago and no response yet,
        // auto-complete the job.
        if (job.completionRequested && job.completedAt) {
          const completedAtMs =
            job.completedAt?.seconds
              ? job.completedAt.seconds * 1000
              : job.completedAt?.toMillis?.() ?? 0;

          if (now - completedAtMs >= AUTO_COMPLETE_MS) {
            try {
              await forceCompleteJob(job.id);
            } catch (e) {
              console.error('Auto-complete failed:', e);
            }
            // Firestore subscription will push the updated doc back — skip here
            continue;
          }
        }

        active.push(job);
      }

      setActiveJobs(active);
      setCompletedJobs(completed);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // ── Worker requests completion ─────────────────────────────────────────────
  const handleRequestCompletion = async (jobId) => {
    if (completing) return; // prevent double-click
    try {
      setError('');
      setCompleting(jobId);
      await requestJobCompletion(jobId, currentUser.uid);
    } catch (err) {
      console.error('Failed to request completion:', err);
      setError(err.message || t('worker.jobs.completion_err'));
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
          <CheckCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-text">{t('worker.jobs.my_title')}</h1>
          <p className="text-gray-500">{t('worker.jobs.my_subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">
          <p className="text-gray-400 font-bold">{t('worker.jobs.loading')}</p>
        </div>
      ) : (
        <>
          {/* ── Active Assignments ────────────────────────────────────────── */}
          <section>
            <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
              {t('worker.jobs.active_section')}
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {activeJobs.length}
              </span>
            </h2>

            {activeJobs.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 font-medium">
                  {t('worker.jobs.no_active')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onComplete={handleRequestCompletion}
                    completing={completing === job.id}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Completed Jobs ────────────────────────────────────────────── */}
          <section>
            <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
              {t('worker.jobs.completed_section')}
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                {completedJobs.length}
              </span>
            </h2>

            {completedJobs.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 font-medium">{t('worker.jobs.no_completed')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default MyJobs;
