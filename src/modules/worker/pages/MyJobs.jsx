import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchMyJobs, completeJob } from '../../../services/workerService';
import JobCard from '../components/JobCard';
import { CheckCircle } from 'lucide-react';

const MyJobs = () => {
  const { currentUser } = useAuth();
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe;
    if (currentUser?.uid) {
      unsubscribe = fetchMyJobs(currentUser.uid, (fetchedJobs) => {
        const active = [];
        const completed = [];
        
        fetchedJobs.forEach(job => {
          if (job.status === 'completed') {
            completed.push(job);
          } else {
            active.push(job);
          }
        });
        
        setActiveJobs(active);
        setCompletedJobs(completed);
        setLoading(false);
      });
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const handleCompleteJob = async (jobId) => {
    try {
      setError('');
      await completeJob(jobId);
    } catch (err) {
      console.error("Failed to complete job:", err);
      setError('Failed to mark job as complete.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
          <CheckCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-text">My Jobs</h1>
          <p className="text-gray-500">Track and manage your active assignments and past completions.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">
          <p className="text-gray-400 font-bold">Loading your jobs...</p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
              Active Assignments
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {activeJobs.length}
              </span>
            </h2>
            
            {activeJobs.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 font-medium">No active jobs. Check the Available Jobs board to find new opportunities.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onComplete={handleCompleteJob} 
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
              Completed Jobs
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                {completedJobs.length}
              </span>
            </h2>
            
            {completedJobs.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 font-medium">You haven't completed any jobs yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    // No onComplete passed so button won't render
                  />
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
