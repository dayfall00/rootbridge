import React from 'react';
import { Clock4, CheckCircle2, Hourglass } from 'lucide-react';

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
  // ── Derived display status ────────────────────────────────────────────────
  const displayStatus =
    job.status === 'completed'
      ? 'Completed'
      : job.completionRequested
      ? 'Pending Confirmation'
      : job.status === 'assigned'
      ? 'Assigned'
      : 'Open';

  const statusStyle = {
    Completed:            'bg-gray-100 text-gray-500',
    'Pending Confirmation': 'bg-amber-100 text-amber-700',
    Assigned:             'bg-blue-100 text-blue-700',
    Open:                 'bg-green-100 text-green-700',
  }[displayStatus] ?? 'bg-gray-100 text-gray-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-text mb-1">{job.title || 'Custom Job'}</h3>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
            {job.category || 'General'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Budget</p>
          <p className="text-2xl font-black text-primary">₹{job.budget?.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 bg-gray-50 p-4 rounded-xl">
        {job.description || 'No description provided.'}
      </p>

      {/* Pending confirmation notice */}
      {job.completionRequested && job.status !== 'completed' && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
          <Hourglass size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <span>
            You marked this job as completed.
            Waiting for shopkeeper confirmation (auto-confirms in 48 h).
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
              Accept Job
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
                  Sending…
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Mark as Completed
                </>
              )}
            </button>
          )}

          {/* Pending badge — disabled visual */}
          {job.completionRequested && job.status !== 'completed' && (
            <div className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-100 text-amber-700 font-bold rounded-xl text-sm cursor-default select-none">
              <Hourglass size={14} />
              Awaiting Confirm
            </div>
          )}

          {/* Completed badge */}
          {job.status === 'completed' && (
            <div className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 text-gray-500 font-bold rounded-xl text-sm cursor-default select-none">
              <CheckCircle2 size={15} />
              Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
