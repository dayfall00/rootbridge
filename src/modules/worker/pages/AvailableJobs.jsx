import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchAvailableJobs, acceptJob } from '../../../services/workerService';
import JobCard from '../components/JobCard';
import { Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AvailableJobs = () => {
  const { t } = useTranslation();
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
      setError(err.message || t('worker.jobs.accept_err'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary/10 rounded-2xl text-primary">
          <Briefcase size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-text">{t('worker.jobs.available_title')}</h1>
          <p className="text-gray-500">{t('worker.jobs.available_subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">
          <p className="text-gray-400 font-bold">{t('worker.jobs.scanning')}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Briefcase size={32} />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">{t('worker.jobs.no_open_jobs')}</h3>
          <p className="text-gray-500">{t('worker.jobs.no_open_desc')}</p>
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
