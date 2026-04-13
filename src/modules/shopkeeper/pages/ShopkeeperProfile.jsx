import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { db } from '../../../services/firebase';
import {
  collection, query, where, onSnapshot, getDocs,
} from 'firebase/firestore';
import {
  MapPin, Phone, Star, IndianRupee, Clock,
  CalendarDays, Briefcase, Edit2, X, CheckCircle,
} from 'lucide-react';
import { uploadToCloudinary } from '../../../services/uploadService';
import { updateUserProfile } from '../../../services/userService';
import { normalizeCity } from '../../../utils/normalize';
import ProfileAvatar from '../../../components/ProfileAvatar';
import { useTranslation } from 'react-i18next';

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  open:      { labelKey: 'shopkeeper.profile.open',      cls: 'bg-green-100 text-green-700' },
  assigned:  { labelKey: 'shopkeeper.profile.assigned',  cls: 'bg-blue-100  text-blue-700'  },
  completed: { labelKey: 'shopkeeper.profile.completed', cls: 'bg-gray-100  text-gray-600'  },
};

const fmt = (n) =>
  typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '₹—';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// ── Component ─────────────────────────────────────────────────────────────────
const ShopkeeperProfile = () => {
  const { t } = useTranslation();
  const { currentUser }           = useAuth();
  const { userData, loadingUser } = useUser();   // users/{uid} — name/phone/city/profileImage

  // ── Avatar: upload-on-select → writes to users/{uid} ─────────────────────
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setAvatarUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'rootbridge_profiles');
      // Persist to users/{uid} — single source of truth; UserContext auto-reloads
      await updateUserProfile(currentUser.uid, { profileImage: url });
      showToast(t('shopkeeper.profile.photo_updated'), 'success');
    } catch (err) {
      console.error('[ShopkeeperProfile] Avatar upload failed:', err);
      showToast(t('shopkeeper.profile.photo_failed'), 'error');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── Edit Modal ────────────────────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm]             = useState({ name: '', phone: '', city: '' });
  const [saving, setSaving]         = useState(false);

  // Sync form from UserContext when modal opens
  useEffect(() => {
    if (isEditOpen) {
      setForm({
        name:  userData?.name  || '',
        phone: userData?.phone || '',
        city:  userData?.city  || '',
      });
    }
  }, [isEditOpen, userData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast(t('shopkeeper.profile.name_empty'), 'error');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        name:  form.name.trim(),
        phone: form.phone.trim(),
        city:  normalizeCity(form.city),
      });
      setIsEditOpen(false);
      showToast(t('shopkeeper.profile.profile_updated'), 'success');
    } catch (err) {
      console.error('[ShopkeeperProfile] Save error:', err);
      showToast(t('shopkeeper.profile.save_failed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // ── Jobs (live) ───────────────────────────────────────────────────────────
  const [jobs,         setJobs]         = useState([]);
  const [avgRating,    setAvgRating]    = useState(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loadingJobs,  setLoadingJobs]  = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'jobs'),
      where('postedBy', '==', currentUser.uid),
      where('jobType',  '==', 'helper')
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const jobList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      jobList.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setJobs(jobList);
      setLoadingJobs(false);

      if (jobList.length === 0) {
        setAvgRating(0);
        setReviewsCount(0);
        return;
      }

      // Fetch reviews (chunk by 30 — Firestore "in" limit)
      const jobIds = jobList.map(j => j.id);
      const CHUNK  = 30;
      let allRatings = [];
      for (let i = 0; i < jobIds.length; i += CHUNK) {
        const chunk = jobIds.slice(i, i + CHUNK);
        const rq    = query(collection(db, 'reviews'), where('jobId', 'in', chunk));
        const rSnap = await getDocs(rq);
        rSnap.forEach(d => {
          const r = d.data().rating;
          if (typeof r === 'number') allRatings.push(r);
        });
      }
      setReviewsCount(allRatings.length);
      setAvgRating(
        allRatings.length > 0
          ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length
          : 0
      );
    }, (err) => {
      console.error('[ShopkeeperProfile] Jobs snapshot error:', err);
      setLoadingJobs(false);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loadingUser || loadingJobs) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex gap-6">
          <Skeleton className="w-20 h-20 !rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const stats = {
    open:      jobs.filter(j => j.status === 'open').length,
    assigned:  jobs.filter(j => j.status === 'assigned').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  // profileImage always from users/{uid} via UserContext
  const profileImage = userData?.profileImage || userData?.avatar || '';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Profile Card ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar — upload-on-select, persists via users/{uid} */}
        <ProfileAvatar
          src={profileImage}
          name={userData?.name || ''}
          size="md"
          loading={avatarUploading}
          inputRef={avatarInputRef}
          onFileChange={handleAvatarSelect}
          onClick={() => avatarInputRef.current?.click()}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-text">
              {userData?.name || t('shopkeeper.profile.role')}
            </h1>
            {/* Edit pencil */}
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
              title={t('shopkeeper.profile.edit_btn')}
            >
              <Edit2 size={17} />
            </button>
          </div>

          <span className="inline-block text-xs font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full mb-3 capitalize">
            {t('shopkeeper.profile.role')}
          </span>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {userData?.city && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                <span className="capitalize">{userData.city}</span>
              </span>
            )}
            {userData?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="text-primary" />
                {userData.phone}
              </span>
            )}
          </div>
        </div>

        {/* Rating Widget */}
        <div className="shrink-0 text-center bg-gray-50 rounded-2xl p-4 min-w-[110px] border border-gray-100">
          {avgRating === null ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          ) : reviewsCount === 0 ? (
            <>
              <p className="text-xs text-gray-400 font-semibold">{t('shopkeeper.profile.rating')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('shopkeeper.profile.no_ratings')}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 font-semibold mb-1">{t('shopkeeper.profile.avg_rating')}</p>
              <div className="flex items-center justify-center gap-1">
                <Star size={16} fill="currentColor" className="text-amber-400" />
                <span className="text-xl font-black text-text">{avgRating.toFixed(1)}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{reviewsCount === 1 ? t('shopkeeper.profile.reviews', { count: reviewsCount }) : t('shopkeeper.profile.reviews_plural', { count: reviewsCount })}</p>
            </>
          )}
        </div>
      </section>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { labelKey: 'shopkeeper.profile.open',      count: stats.open,      bg: 'bg-green-50', text: 'text-green-700' },
          { labelKey: 'shopkeeper.profile.assigned',  count: stats.assigned,  bg: 'bg-blue-50',  text: 'text-blue-700'  },
          { labelKey: 'shopkeeper.profile.completed', count: stats.completed, bg: 'bg-gray-50',  text: 'text-gray-600'  },
        ].map(({ labelKey, count, bg, text }) => (
          <div key={labelKey} className={`${bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-black ${text}`}>{count}</p>
            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wide">{t(labelKey)}</p>
          </div>
        ))}
      </section>

      {/* ── Posted Jobs ───────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-primary" />
          {t('shopkeeper.profile.job_posts', { count: jobs.length })}
        </h2>

        {jobs.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-gray-600 font-semibold">{t('shopkeeper.profile.no_jobs')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const s = STATUS_STYLE[job.status] || STATUS_STYLE.open;
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-text">{job.title}</h3>
                      <p className="text-primary text-sm font-semibold capitalize">
                        {t('shopkeeper.profile.shop_suffix', { category: t(`categories.${job.category?.toLowerCase()}`, { defaultValue: job.category }) })}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full capitalize shrink-0 ${s.cls}`}>
                      {t(s.labelKey)}
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-500 leading-relaxed">{job.description}</p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <IndianRupee size={14} className="text-primary shrink-0" />
                      {fmt(job.budget)}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock size={14} className="text-primary shrink-0" />
                      {job.workDuration || '—'}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <CalendarDays size={14} className="text-primary shrink-0" />
                      {job.workingHours || '—'}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin size={14} className="text-primary shrink-0" />
                      <span className="capitalize">{job.city || '—'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-3 rounded-lg font-bold text-sm text-white shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* ── Edit Profile Modal ─────────────────────────────────────────────── */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-2xl font-bold text-text">{t('shopkeeper.profile.edit_title')}</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  {t('shopkeeper.profile.full_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={t('shopkeeper.profile.your_name')}
                  disabled={saving}
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  {t('shopkeeper.profile.phone')} <span className="text-gray-400 font-normal normal-case ml-1">{t('shopkeeper.profile.optional')}</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder={t('shopkeeper.profile.eg_phone')}
                  disabled={saving}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  {t('shopkeeper.profile.city')}
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder={t('shopkeeper.profile.eg_city')}
                  disabled={saving}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  {t('shopkeeper.profile.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.name.trim()}
                  className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {saving ? t('shopkeeper.profile.saving') : t('shopkeeper.profile.save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperProfile;
