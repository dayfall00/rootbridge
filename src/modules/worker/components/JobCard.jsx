import React from 'react';
import { Clock4, CheckCircle2, Hourglass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Displays a single job card for the worker.
 *
 * Props:
 *  - job          : Firestore job document (with `id`)
 *  - onAccept     : (jobId) => void  — called when worker accepts an open job
 *  - onComplete   : (jobId) => void  — called when worker requests completion
 *  - completing   : boolean          — true while the async request is in-flight
 */
const JobCard = ({ job, onAccept, onComplete, completing = false }) => {
  const { t } = useTranslation();
  // ── Derived display status ────────────────────────────────────────────────
  const displayStatus =
    job.status === 'completed'
      ? t('status.completed')
      : job.completionRequested
      ? t('status.pending_confirmation')
      : job.status === 'assigned'
      ? t('status.assigned')
      : t('status.open');

  const statusStyle = {
    [t('status.completed')]:            'bg-gray-100 text-gray-500',
    [t('status.pending_confirmation')]: 'bg-amber-100 text-amber-700',
    [t('status.assigned')]:             'bg-blue-100 text-blue-700',
    [t('status.open')]:                 'bg-green-100 text-green-700',
  }[displayStatus] ?? 'bg-gray-100 text-gray-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-text mb-1">{job.title || 'Custom Job'}</h3>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
            {job.category || t('worker.job_card.general')}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">{t('worker.job_card.budget')}</p>
          <p className="text-2xl font-black text-primary">₹{job.budget?.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 bg-gray-50 p-4 rounded-xl">
        {job.description || t('worker.job_card.no_desc')}
      </p>

      {/* Pending confirmation notice */}
      {job.completionRequested && job.status !== 'completed' && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
          <Hourglass size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <span>
            {t('worker.job_card.waiting_desc')}
          </span>
        </div>
      )}

      {/* Footer: status + action button */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto gap-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyle}`}>
          {displayStatus}
        </span>

        <div className="flex gap-2">
          {/* Accept — open jobs */}
          {job.status === 'open' && onAccept && (
            <button
              onClick={() => onAccept(job.id)}
              className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              {t('worker.job_card.accept_job')}
            </button>
          )}

          {/* Mark as Completed — assigned & request not yet sent */}
          {job.status === 'assigned' && !job.completionRequested && onComplete && (
            <button
              onClick={() => onComplete(job.id)}
              disabled={completing}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completing ? (
                <>
                  <Clock4 size={15} className="animate-spin" />
                  {t('worker.job_card.sending')}
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  {t('worker.job_card.mark_completed')}
                </>
              )}
            </button>
          )}

          {/* Pending badge — disabled visual */}
          {job.completionRequested && job.status !== 'completed' && (
            <div className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-100 text-amber-700 font-bold rounded-xl text-sm cursor-default select-none">
              <Hourglass size={14} />
              {t('worker.job_card.awaiting_confirm')}
            </div>
          )}

          {/* Completed badge */}
          {job.status === 'completed' && (
            <div className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 text-gray-500 font-bold rounded-xl text-sm cursor-default select-none">
              <CheckCircle2 size={15} />
              {t('status.completed')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
