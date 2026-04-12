import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchAvailableJobs, acceptJob } from '../../../services/workerService';
import JobCard from '../components/JobCard';
import { Briefcase } from 'lucide-react';

const AvailableJobs = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe;
    if (currentUser?.uid) {
      unsubscribe = fetchAvailableJobs((fetchedJobs) => {
        setJobs(fetchedJobs);
        setLoading(false);
      });
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const handleAcceptJob = async (jobId) => {
    if (!currentUser?.uid) return;
    try {
      setError('');
      await acceptJob(jobId, currentUser.uid);
    } catch (err) {
      console.error("Failed to accept job:", err);
      setError(err.message || 'Failed to accept job. It might have been taken already.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary/10 rounded-2xl text-primary">
          <Briefcase size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-text">Available Jobs</h1>
          <p className="text-gray-500">Find and accept new custom job requests.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">
          <p className="text-gray-400 font-bold">Scanning for open jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Briefcase size={32} />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">No Open Jobs</h3>
          <p className="text-gray-500">There are currently no available jobs in the marketplace. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onAccept={handleAcceptJob} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableJobs;
