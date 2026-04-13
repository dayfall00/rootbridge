import React, { useState, useEffect } from 'react';
import { Briefcase, Star, MapPin, BadgeCheck } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const CustomerProfile = ({ currentUser }) => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  // Loading flag explicitly evaluated based on two independent loads
  const isLoading = !jobsLoaded || !reviewsLoaded;

  useEffect(() => {
    // Escape hatch
    if (!currentUser?.uid) return;

    // Reset loaders when ID shifts to cover race conditions dynamically
    setJobsLoaded(false);
    setReviewsLoaded(false);

    // Stream 1: Customer Jobs
    const jobsQuery = query(collection(db, "jobs"), where("postedBy", "==", currentUser.uid));
    const unsubscribeJobs = onSnapshot(
      jobsQuery, 
      (snapshot) => {
        setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setJobsLoaded(true);
      }, 
      (error) => {
        console.error("Error fetching customer jobs:", error);
        setJobsLoaded(true);
      }
    );

    // Stream 2: Customer Reviews
    const reviewsQuery = query(collection(db, "reviews"), where("customerId", "==", currentUser.uid));
    const unsubscribeReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setReviewsLoaded(true);
      },
      (error) => {
        console.error("Error fetching customer reviews:", error);
        setReviewsLoaded(true);
      }
    );

    return () => {
      unsubscribeJobs();
      unsubscribeReviews();
    };
  }, [currentUser]);

  // Aggregate Math logic for Top Review Star Array Box
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 pb-40 w-full h-full flex-1">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Section 1: Jobs Posted */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <h3 className="font-headline text-xl font-bold mb-6 text-text flex items-center gap-2">
          <Briefcase size={22} className="text-primary" />
          {t('profile.customer.jobs_posted')}
        </h3>
        
        {jobs.length === 0 ? (
          <p className="text-gray-500 italic text-sm text-center py-6">{t('profile.customer.no_jobs')}</p>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:bg-gray-100">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-sm text-text">{job.title || job.category || t('profile.customer.untitled_job')}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      {job.city && (
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} /> {job.city}
                        </p>
                      )}
                      {job.status && (
                        <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 rounded-md">
                          {job.status}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-4">
                  <p className="font-bold text-primary">₹{job.budget || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Ratings & Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-xl font-bold text-text flex items-center gap-2">
            <BadgeCheck size={22} className="text-green-500" />
            {t('profile.customer.ratings_reviews')}
          </h3>
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-4 py-2 rounded-xl border border-yellow-100 font-bold">
            <Star className="fill-yellow-500 text-yellow-500" size={18} />
            <span>{avgRating ? avgRating : t('profile.customer.no_ratings')}</span>
          </div>
        </div>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic text-sm text-center py-6">{t('profile.customer.no_reviews')}</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        className={star <= Number(review.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'} 
                      />
                    ))}
                  </div>
                  {review.createdAt && (
                    <p className="text-xs text-gray-400 font-medium">
                      {review.createdAt?.toDate 
                        ? review.createdAt.toDate().toLocaleDateString() 
                        : new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-body">
                  {review.comment || <span className="italic text-gray-400">{t('profile.customer.no_comment')}</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
