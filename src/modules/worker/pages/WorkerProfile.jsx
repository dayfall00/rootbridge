import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { db } from '../../../services/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Phone, MapPin, Briefcase, Wrench, CheckCircle, Edit2, X } from 'lucide-react';
import { updateUserProfile } from '../../../services/userService';
import { uploadToCloudinary } from '../../../services/uploadService';
import ProfileAvatar from '../../../components/ProfileAvatar';
import { normalizeCategory, normalizeCity } from '../../../utils/normalize';
import { useTranslation } from 'react-i18next';

const ALLOWED_CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner'];

const WorkerProfile = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { userData } = useUser();

  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Avatar: upload-on-select (no blob URL —  persists through refresh) ───────
  // Source of truth: userData.profileImage (from UserContext → users/{uid})
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setAvatarUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file, 'rootbridge_profiles');
      // Persist to users/{uid} — single source of truth; UserContext picks it up automatically
      await updateUserProfile(currentUser.uid, { profileImage: imageUrl });
    } catch (err) {
      console.error('[WorkerProfile] Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };


  // ── Modal / Form State ──────────────────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [category,     setCategory]     = useState('');
  const [skillsString, setSkillsString] = useState('');
  const [isAvailable,  setIsAvailable]  = useState(true);
  const [city,         setCity]         = useState('');
  const [name,         setName]         = useState('');

  // Sync user fields into form whenever userData changes (outside modal)
  useEffect(() => {
    if (!isEditModalOpen) {
      if (userData?.city) setCity(userData.city);
      if (userData?.name) setName(userData.name);
    }
  }, [userData?.city, userData?.name, isEditModalOpen]);

  // ── Phase 1: One-time doc init ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;
    const workerRef = doc(db, 'workers', currentUser.uid);

    getDoc(workerRef).then((snap) => {
      if (!snap.exists()) {
        setDoc(workerRef, {
          uid: currentUser.uid,
          category: '',
          skills: [],
          isAvailable: true,
          rating: 0,
          completedJobs: 0,
        }, { merge: true }).catch(console.error);
      }
    }).catch(console.error);
  }, [currentUser?.uid]);

  // ── Phase 2: Real-time subscription (separate from init) ───────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;
    const workerRef = doc(db, 'workers', currentUser.uid);

    const unsubscribe = onSnapshot(workerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWorkerData(data);

        if (!isEditModalOpen) {
          setCategory(data.category   || '');
          setSkillsString(data.skills ? data.skills.join(', ') : '');
          setIsAvailable(data.isAvailable ?? true);
        }
      }
      setLoading(false);
    }, (err) => {
      console.error('Worker snapshot error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]); // ← no isEditModalOpen dependency; no re-subscription on modal toggle

  // ── Save handler ────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!category) {
      setToast({ show: true, message: t('worker.profile.category_req'), type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }

    setSaving(true);
    try {
      const parsedSkills = Array.from(
        new Set(skillsString.split(',').map(s => s.trim()).filter(Boolean))
      );

      const workerRef = doc(db, 'workers', currentUser.uid);
      const promises  = [
        // Write city + category normalized so marketplace filtering never has casing mismatches
        setDoc(workerRef, {
          category:    normalizeCategory(category),
          skills:      parsedSkills,
          isAvailable,
          city:        normalizeCity(city),
        }, { merge: true }),
      ];

      const userUpdates = {};
      if (city !== userData?.city)  userUpdates.city = city;   // updateUserProfile normalizes internally
      if (name !== userData?.name)  userUpdates.name = name;
      if (Object.keys(userUpdates).length > 0) {
        promises.push(updateUserProfile(currentUser.uid, userUpdates));
      }

      await Promise.all(promises);
      setToast({ show: true, message: t('worker.profile.update_success'), type: 'success' });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: t('worker.profile.update_fail'), type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative">
            <ProfileAvatar
              src={userData?.profileImage || userData?.avatar || ''}
              name={userData?.name || ''}
              loading={avatarUploading}
              inputRef={avatarInputRef}
              onFileChange={handleImageChange}
              onClick={() => avatarInputRef.current?.click()}
            />
            <div className="absolute -top-2 -left-2 bg-secondary px-2 py-1 flex items-center justify-center rounded-lg border-2 border-white shadow-sm z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white leading-none">Worker</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h2 className="font-headline text-4xl font-extrabold text-text tracking-tight">{userData?.name || 'Worker'}</h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                title={t('worker.profile.edit_btn')}
              >
                <Edit2 size={20} />
              </button>
            </div>
            <p className="font-body text-gray-500 flex items-center gap-2 mt-1">
              <Phone size={14} /> {userData?.phone || t('worker.profile.not_provided')}
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-headline text-xl font-bold mb-6 text-text">{t('worker.profile.details')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">{t('worker.profile.category_label')}</h4>
                  <p className="text-xs text-gray-500">
                    {workerData?.category 
                      ? t(`categories.${workerData.category.toLowerCase().replace(/ /g, '_')}`, { defaultValue: workerData.category }) 
                      : t('worker.profile.not_provided')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Wrench size={24} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">{t('worker.profile.skills_label')}</h4>
                  <p className="text-xs text-gray-500">{workerData?.skills?.length > 0 ? workerData.skills.join(', ') : t('worker.profile.not_provided')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">{t('worker.profile.city_label')}</h4>
                  <p className="text-xs text-gray-500">{userData?.city || t('worker.profile.not_provided')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle size={24} className={workerData?.isAvailable ? 'text-green-500' : 'text-gray-400'} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-text">{t('worker.profile.availability_label')}</h4>
                  <p className="text-xs text-gray-500">{workerData?.isAvailable ? t('worker.profile.available') : t('worker.profile.unavailable')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-headline text-lg font-bold mb-6 text-text">{t('worker.profile.stats')}</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <span className="font-headline font-black text-primary text-xl">{workerData?.rating || '0.0'}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-text">{t('worker.profile.rating')}</p>
                <p className="text-xs text-gray-500">{t('worker.profile.rating_desc')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">{t('worker.profile.completed_jobs')}</span>
                <div className="flex-1 ml-4 flex justify-end">
                  <div className="font-bold text-sm bg-gray-100 px-3 py-1 rounded-full text-text">{workerData?.completedJobs || 0}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">{t('worker.profile.active_jobs')}</span>
                <div className="flex-1 ml-4 flex justify-end">
                  <div className="font-bold text-sm bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg font-bold text-sm text-white shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-2xl font-bold text-text">{t('worker.profile.edit_title')}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{t('worker.profile.full_name')} <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('worker.profile.eg_name')} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{t('worker.profile.category_label')} <span className="text-red-500">*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" required>
                  <option value="" disabled>{t('worker.profile.select_category')}</option>
                  {ALLOWED_CATEGORIES.map(cat => <option key={cat} value={cat}>{t(`categories.${cat.toLowerCase()}`, { defaultValue: cat })}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{t('worker.profile.skills_label')} <span className="text-gray-400 font-normal lowercase tracking-normal ml-1">{t('worker.profile.comma_separated')}</span></label>
                <input type="text" value={skillsString} onChange={(e) => setSkillsString(e.target.value)} placeholder={t('worker.profile.eg_skills')} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{t('worker.profile.city_label')}</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('worker.profile.eg_city')} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between cursor-pointer group bg-gray-50 p-4 border border-gray-200 rounded-xl">
                  <div>
                    <p className="font-bold text-text group-hover:text-primary transition-colors text-sm">{t('worker.profile.available')}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{t('worker.profile.turn_off_jobs')}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="peer sr-only" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} disabled={saving} />
                    <div className="block bg-gray-200 w-12 h-7 rounded-full peer-checked:bg-primary transition-colors" />
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${isAvailable ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-8">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all">{t('common.cancel')}</button>
                <button type="submit" disabled={saving || !category} className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md">
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProfile;
