import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { db } from '../../../services/firebase';
import {
  doc, setDoc, onSnapshot,
  collection, query, where, serverTimestamp,
} from 'firebase/firestore';
import { Phone, MapPin, Store, Tag, AlignLeft, Edit2, X, CheckCircle, ShieldCheck, User } from 'lucide-react';
import { uploadToCloudinary } from '../../../services/uploadService';
import { updateUserProfile } from '../../../services/userService';
import { normalizeCategory } from '../../../utils/normalize';
import ProfileAvatar from '../../../components/ProfileAvatar';
import { COLLECTIONS } from '../../../constants/appConstants';

const ARTISAN_CATEGORIES = [
  'Handicraft', 'Jewelry', 'Clothing', 'Home Decor', 'Food & Spices', 'Art', 'Other',
];

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const ArtisanProfile = () => {

  const { currentUser }         = useAuth();
  const { userData, loadingUser } = useUser();   // users/{uid} — source of truth for name/image/city/phone

  // ── Artisan doc state ───────────────────────────────────────────────────────
  const [artisanData, setArtisanData] = useState(null);
  const [artisanLoading, setArtisanLoading]   = useState(true);
  const [productCount, setProductCount]       = useState(0);

  // ── Avatar upload ───────────────────────────────────────────────────────────
  // profileImage is ALWAYS derived from userData.profileImage (users collection).
  // We never store a blob URL — upload happens immediately on file select.
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // ── Edit modal ──────────────────────────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', shopName: '', category: '', description: '' });
  const [saving, setSaving] = useState(false);

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // ── Product count (live) ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, COLLECTIONS.PRODUCTS), where('ownerId', '==', currentUser.uid));
    return onSnapshot(q, (snap) => setProductCount(snap.size));
  }, [currentUser?.uid]);

  // ── Artisan doc (live) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;

    const artisanRef = doc(db, COLLECTIONS.ARTISANS, currentUser.uid);

    const unsub = onSnapshot(artisanRef, async (snap) => {
      if (!snap.exists()) {
        // Auto-create default doc for new artisans
        const defaults = {
          uid:          currentUser.uid,
          shopName:     '',
          category:     '',
          description:  '',
          createdAt:    serverTimestamp(),
        };
        try {
          await setDoc(artisanRef, defaults, { merge: true });
        } catch (err) {
          console.error('[ArtisanProfile] auto-create failed:', err);
        }
        setArtisanData(defaults);
      } else {
        setArtisanData(snap.data());
      }
      setArtisanLoading(false);
    }, (err) => {
      console.error('[ArtisanProfile] Firestore snapshot error:', err);
      showToast('Failed to load profile.', 'error');
      setArtisanLoading(false);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  // ── Sync form when modal opens ──────────────────────────────────────────────
  useEffect(() => {
    if (isEditModalOpen) {
      setForm({
        name:        userData?.name     || '',
        shopName:    artisanData?.shopName    || '',
        category:    artisanData?.category    || '',
        description: artisanData?.description || '',
      });
    }
  }, [isEditModalOpen, artisanData, userData]);

  // ── Avatar: upload immediately on file select ───────────────────────────────
  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setAvatarUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'rootbridge_profiles');
      // Persist to users/{uid}.profileImage — single source of truth
      await updateUserProfile(currentUser.uid, { profileImage: url });
      showToast('Profile photo updated!', 'success');
    } catch (err) {
      console.error('[ArtisanProfile] Avatar upload failed:', err);
      showToast('Photo upload failed. Please try again.', 'error');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.shopName.trim()) {
      showToast('Shop name cannot be empty.', 'error');
      return;
    }
    if (!form.category) {
      showToast('Please select a category.', 'error');
      return;
    }

    setSaving(true);
    try {
      const writes = [];

      // users/{uid} — name (and any future user-level fields)
      if (form.name.trim() !== (userData?.name || '')) {
        writes.push(updateUserProfile(currentUser.uid, { name: form.name.trim() }));
      }

      // artisans/{uid} — shop data
      writes.push(
        setDoc(doc(db, COLLECTIONS.ARTISANS, currentUser.uid), {
          shopName:    form.shopName.trim(),
          category:    normalizeCategory(form.category),
          description: form.description.trim(),
        }, { merge: true })
      );

      await Promise.all(writes);

      // Optimistic local update for artisan data
      setArtisanData(prev => ({
        ...prev,
        shopName:    form.shopName.trim(),
        category:    normalizeCategory(form.category),
        description: form.description.trim(),
      }));

      setIsEditModalOpen(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('[ArtisanProfile] Save error:', err);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  // profileImage comes exclusively from users collection (via UserContext)
  const profileImage = userData?.profileImage || userData?.avatar || '';
  const isLoading    = loadingUser || artisanLoading;

  // ── Skeleton while loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto pb-12">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 !rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </section>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
          <div className="col-span-12 lg:col-span-4">
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-12">

      {/* ── Profile Header ─────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative">
            <ProfileAvatar
              src={profileImage}
              name={userData?.name || ''}
              loading={avatarUploading}
              inputRef={avatarInputRef}
              onFileChange={handleAvatarSelect}
              onClick={() => avatarInputRef.current?.click()}
            />
            <div className="absolute -top-2 -left-2 bg-tertiary px-2 py-1 flex items-center justify-center rounded-lg border-2 border-white shadow-sm z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white leading-none">Artisan</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4">
              <h1 className="font-headline text-4xl font-extrabold text-text tracking-tight">
                {userData?.name || 'Artisan'}
              </h1>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                title="Edit Profile"
              >
                <Edit2 size={20} />
              </button>
            </div>
            <p className="font-body text-gray-500 flex items-center gap-2 mt-1">
              <Phone size={14} /> {userData?.phone || 'Not provided'}
            </p>
            {artisanData?.shopName && (
              <p className="font-body text-sm text-primary flex items-center gap-2 mt-1 font-semibold">
                <Store size={14} /> {artisanData.shopName}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-8 items-start">

        {/* Left — Artisan Details */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-headline text-xl font-bold mb-6 text-text">Artisan Details</h3>
            <div className="space-y-4">

              <DetailRow icon={<User size={24} />} label="Full Name" value={userData?.name} />
              <DetailRow icon={<Store size={24} />} label="Shop Name" value={artisanData?.shopName} />
              <DetailRow icon={<Tag size={24} />} label="Category" value={artisanData?.category} />
              <DetailRow icon={<AlignLeft size={24} />} label="Description" value={artisanData?.description} />
              <DetailRow icon={<MapPin size={24} />} label="City" value={userData?.city} />

            </div>
          </div>
        </div>

        {/* Right — Store Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-headline text-lg font-bold mb-6 text-text">Store Stats</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <span className="font-headline font-black text-primary text-xl">{productCount}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-text">Products Listed</p>
                <p className="text-xs text-gray-500">In your artisan store</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 w-24">Category</span>
                <div className="flex-1 ml-4 flex justify-end">
                  <div className="font-bold text-sm bg-gray-100 px-3 py-1 rounded-full text-text capitalize">
                    {artisanData?.category || '—'}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
                  <ShieldCheck className="shrink-0 mt-0.5" size={18} />
                  <p>Your shop info is only visible to verified customers on RootBridge.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-3 rounded-lg font-bold text-sm text-white shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-2xl font-bold text-text">Edit Artisan Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              {/* Name */}
              <FormField label="Full Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  disabled={saving}
                  className="input-style"
                />
              </FormField>

              {/* Shop Name */}
              <FormField label="Shop Name" required>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                  placeholder="e.g. Meera's Crafts"
                  disabled={saving}
                  className="input-style"
                />
              </FormField>

              {/* Category */}
              <FormField label="Category" required>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  disabled={saving}
                  className="input-style"
                >
                  <option value="" disabled>Select a category</option>
                  {ARTISAN_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </FormField>

              {/* Description */}
              <FormField label="Description" hint="(Optional)">
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Tell customers about your craft, specialty, or story..."
                  rows={4}
                  disabled={saving}
                  className="input-style resize-none"
                />
              </FormField>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.shopName.trim() || !form.category}
                  className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-headline font-bold text-sm text-text">{label}</h4>
      <p className="text-xs text-gray-500 capitalize">{value || 'Not set'}</p>
    </div>
  </div>
);

const FormField = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      {hint && <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">{hint}</span>}
    </label>
    {React.cloneElement(children, {
      className: `${children.props.className || ''} w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium`,
    })}
  </div>
);

export default ArtisanProfile;
