import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { Phone, BadgeCheck, Edit2, User, Mail, GraduationCap, MapPin, X, Upload, Star, Briefcase } from 'lucide-react';
import { updateUserProfile } from '../../services/userService';
import { storage, db } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const UserProfile = () => {
  const { userData, primaryRole, setPrimaryRole } = useUser();
  const { currentUser } = useAuth();

  const activeRole = primaryRole || userData?.roles?.[0] || null;
  const showTrustScore = activeRole === 'worker' || activeRole === 'artisan';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    qualification: '',
    city: ''
  });

  const [customerJobs, setCustomerJobs] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  
  const isLoadingActivity = !jobsLoaded || !reviewsLoaded;

  useEffect(() => {
    if (activeRole !== 'customer' || !currentUser?.uid) return;

    setJobsLoaded(false);
    setReviewsLoaded(false);

    console.log("Activity Subscription User UID:", currentUser.uid);

    const jobsQuery = query(collection(db, "jobs"), where("postedBy", "==", currentUser.uid));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Customer jobs:", jobs);
      setCustomerJobs(jobs);
      setJobsLoaded(true);
    }, (error) => {
      console.error(error);
      setJobsLoaded(true);
    });

    const reviewsQuery = query(collection(db, "reviews"), where("customerId", "==", currentUser.uid));
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Customer reviews:", reviews);
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
        setAverageRating(sum / reviews.length);
      } else {
        setAverageRating(0);
      }
      setReviewsLoaded(true);
    }, (error) => {
      console.error(error);
      setReviewsLoaded(true);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeReviews();
    };
  }, [activeRole, currentUser]);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        qualification: userData.qualification || '',
        city: userData.city || ''
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ show: true, message: 'Please select an image file', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToast({ show: true, message: 'Image size must be less than 2MB', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const storageRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Save URL in Firestore instantly
      await updateUserProfile(currentUser.uid, { avatar: downloadURL });
      
      setToast({ show: true, message: 'Avatar updated successfully!', type: 'success' });
    } catch (error) {
      console.error("Upload error:", error);
      setToast({ show: true, message: 'Failed to upload avatar', type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        name: formData.name,
        phone: formData.phone,
        qualification: formData.qualification,
        city: formData.city
      });
      setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      setToast({ show: true, message: 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    }
  };
  
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* Profile Header Block */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img alt="User avatar" className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-gray-200" src={userData?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAiA4cAqcaPKCQS9RnfMBUu-Q_ZUp0Snxm1HcSfHj1tmVwVpWhHAMtODoGn18CAsnLnc7PMowiLl8a4Ga_zQRi5PeCo395GKevrnb-K0pmssFpTvFGUvL8UKcbDUnwLobRhHeamC1CXbuWir0P7hklU9mwtbPeGL_ncmRntJdC9UBtUJgYzuV145qx6ZGX28qylhCHwN17hcmN6zr8usmqRuxlC8J6k9CMGcAWDerc5d5njh_OilCUh3MfWZhGZLDFj7pN96f3wPZ4"} />
            <div className="absolute -bottom-2 -right-2 bg-secondary p-1.5 rounded-lg border-2 border-white">
              <BadgeCheck className="text-white" size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h2 className="font-headline text-4xl font-extrabold text-text tracking-tight">{userData?.name || 'RootBridge User'}</h2>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                title="Edit Profile"
              >
                <Edit2 size={20} />
              </button>
            </div>
            <p className="font-body text-gray-500 flex items-center gap-2 mt-1">
              <Phone size={14} /> {userData?.phone || 'Not Provided'}
            </p>
          </div>
        </div>

        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center shadow-inner">
          {userData?.roles?.map((role) => (
            <button 
              key={role}
              onClick={() => setPrimaryRole(role)}
              className={`px-6 py-2 rounded-lg text-sm transition-all capitalize ${activeRole === role ? 'font-bold bg-white text-primary shadow-sm' : 'font-semibold text-gray-500 hover:text-text'}`}
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      {/* Dashboard Grid / Visuals */}
      <div className="grid grid-cols-12 gap-8 items-start">
        <div className={`col-span-12 ${activeRole === 'customer' ? 'lg:col-span-6' : (showTrustScore ? 'lg:col-span-8' : 'lg:col-span-12')} space-y-8`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-headline text-xl font-bold mb-6 text-text">User Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">Full Name</h4>
                  <p className="text-xs text-gray-500">{userData?.name || 'RootBridge User'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">Email Address</h4>
                  <p className="text-xs text-gray-500">{currentUser?.email || userData?.email || 'Not Provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">Phone Number</h4>
                  <p className="text-xs text-gray-500">{userData?.phone || 'Not Provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">Qualification</h4>
                  <p className="text-xs text-gray-500">{userData?.qualification || 'Not Provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">Location</h4>
                  <p className="text-xs text-gray-500">{userData?.city || 'Not Provided'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {(showTrustScore || activeRole === 'customer') && (
          <div className={`col-span-12 ${activeRole === 'customer' ? 'lg:col-span-6' : 'lg:col-span-4'} space-y-8`}>
            {activeRole === 'customer' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline text-xl font-bold text-text">Your Activity</h3>
                  <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-4 py-2 rounded-xl border border-yellow-100 font-bold">
                    <Star className="fill-yellow-500 text-yellow-500" size={18} />
                    <span>{averageRating > 0 ? averageRating.toFixed(1) : 'No ratings yet'}</span>
                  </div>
                </div>
                
                {isLoadingActivity ? (
                   <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : customerJobs.length === 0 ? (
                   <p className="text-gray-500 italic text-sm text-center py-6">No jobs posted yet</p>
                ) : (
                   <div className="space-y-4">
                     {customerJobs.map(job => (
                       <div key={job.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:bg-gray-100">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                             <Briefcase size={20} />
                           </div>
                           <div>
                             <p className="font-bold text-sm text-text">{job.title || job.category || 'Untitled Job'}</p>
                             {job.status && <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mt-1 px-2 py-0.5 bg-blue-100 rounded-md inline-block">{job.status}</p>}
                           </div>
                         </div>
                         <p className="font-bold text-primary pl-4">₹{job.budget || 0}</p>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            )}

            {showTrustScore && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-headline text-lg font-bold mb-6 text-text">Trust Score</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <span className="font-headline font-black text-primary text-xl">98</span>
              </div>
              <div>
                <p className="text-sm font-bold text-text">Top 2% Globally</p>
                <p className="text-xs text-gray-500">Based on 52 verified client reviews</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">Punctuality</span>
                <div className="flex-1 ml-4 h-1.5 bg-gray-100 rounded-full">
                  <div className="bg-primary h-full rounded-full w-[100%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">Craftsmanship</span>
                <div className="flex-1 ml-4 h-1.5 bg-gray-100 rounded-full">
                  <div className="bg-primary h-full rounded-full w-[95%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">Communication</span>
                <div className="flex-1 ml-4 h-1.5 bg-gray-100 rounded-full">
                  <div className="bg-primary h-full rounded-full w-[98%]"></div>
                </div>
              </div>
            </div>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg font-bold text-sm text-white shadow-lg transition-all z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-2xl font-bold text-text">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* avatar upload block */}
              <div className="flex justify-center mb-4">
                <div 
                  className={`relative group cursor-pointer ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`} 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img src={userData?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAiA4cAqcaPKCQS9RnfMBUu-Q_ZUp0Snxm1HcSfHj1tmVwVpWhHAMtODoGn18CAsnLnc7PMowiLl8a4Ga_zQRi5PeCo395GKevrnb-K0pmssFpTvFGUvL8UKcbDUnwLobRhHeamC1CXbuWir0P7hklU9mwtbPeGL_ncmRntJdC9UBtUJgYzuV145qx6ZGX28qylhCHwN17hcmN6zr8usmqRuxlC8J6k9CMGcAWDerc5d5njh_OilCUh3MfWZhGZLDFj7pN96f3wPZ4"} alt="Avatar Preview" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-gray-50" />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white" size={24} />
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  id="avatarUpload" 
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                  onChange={handleAvatarChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" required />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email <span className="text-gray-400 font-normal lowercase tracking-normal ml-1">(Read-only)</span></label>
                <input type="email" value={currentUser?.email || userData?.email || 'Not Provided'} readOnly className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none font-medium opacity-80" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" required />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Qualification <span className="text-gray-400 font-normal lowercase tracking-normal ml-1">(Optional)</span></label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. Certified Arborist" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Location (City)</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. New York" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" required />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 pt-6 mt-8">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" disabled={isSaving || (formData.name === (userData?.name || '') && formData.phone === (userData?.phone || '') && formData.qualification === (userData?.qualification || '') && formData.city === (userData?.city || ''))} className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
