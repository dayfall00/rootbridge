import React from 'react';

const JobCard = ({ job, onAccept, onComplete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-text mb-1">{job.title || 'Custom Job'}</h3>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
            {job.category || 'General'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Budget</p>
          <p className="text-2xl font-black text-primary">${job.budget}</p>
        </div>
      </div>
      
      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 bg-gray-50 p-4 rounded-xl">
        {job.description || 'No description provided.'}
      </p>
      
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto gap-4">
        <div className="text-sm font-bold text-gray-400">
          Status: <span className="text-text capitalize">{job.status}</span>
        </div>
        
        <div className="flex gap-2">
          {job.status === 'open' && onAccept && (
            <button 
              onClick={() => onAccept(job.id)}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Accept Job
            </button>
          )}
          
          {job.status === 'assigned' && onComplete && (
            <button 
              onClick={() => onComplete(job.id)}
              className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Mark Complete
            </button>
          )}

          {job.status === 'completed' && (
            <div className="px-6 py-2.5 bg-gray-100 text-gray-500 font-bold rounded-xl cursor-default">
              Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
