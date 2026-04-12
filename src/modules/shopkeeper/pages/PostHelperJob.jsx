import React, { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { createHelperJob } from '../../../services/jobService';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const SHOP_CATEGORIES = [
  'Grocery', 'Clothing', 'Electronics', 'Restaurant', 'Hardware', 'Other',
];

const DURATION_OPTIONS = ['Full-time', 'Part-time'];

// ── Component ─────────────────────────────────────────────────────────────────
const PostHelperJob = () => {
  const { userData } = useUser();
  const navigate     = useNavigate();

  // ── Initial state — auto-fill from user profile ───────────────────────────
  const [form, setForm] = useState({
    category:      '',
    title:         '',
    description:   '',
    budget:        '',
    workDuration:  '',
    workingHours:  '',
    city:          '',
    contactNumber: '',
  });

  // Sync city/phone once userData loads (handles case where userData arrives after mount)
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      city:          prev.city          || userData?.city  || '',
      contactNumber: prev.contactNumber || userData?.phone || '',
    }));
  }, [userData]);

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert budget to number immediately for clean storage
    setForm(prev => ({
      ...prev,
      [name]: name === 'budget' ? value : value,   // keep as string while typing
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.category)                                     e.category      = 'Shop type is required.';
    if (!form.title.trim())                                 e.title         = 'Job title is required.';
    if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) <= 0)
                                                            e.budget        = 'Enter a valid wage amount (₹).';
    if (!form.workDuration)                                 e.workDuration  = 'Select work duration.';
    if (!form.workingHours.trim())                          e.workingHours  = 'Specify working hours.';
    if (!form.city.trim())                                  e.city          = 'City is required.';
    if (!form.contactNumber.trim() || !/^\+?[0-9]{10,13}$/.test(form.contactNumber.replace(/\s/g, '')))
                                                            e.contactNumber = 'Enter a valid phone number.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // ✅ PART 1 FIX: convert budget to Number before saving
      await createHelperJob({ ...form, budget: Number(form.budget) });
      setSuccess(true);
      setTimeout(() => navigate('/shopkeeper/my-jobs'), 1800);
    } catch (err) {
      console.error('[PostHelperJob]', err);
      setErrors({ submit: err.message || 'Failed to post job. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const inputCls = (field) =>
    `w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-text
     focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
     transition-colors ${errors[field] ? 'border-red-400 bg-red-50/40' : 'border-gray-200'}`;

  const FieldError = ({ field }) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  const placeholder = {
    Grocery:     'e.g. Need helper for grocery shop',
    Restaurant:  'e.g. Need waiter / kitchen helper',
    Clothing:    'e.g. Need shop assistant for clothing store',
    Electronics: 'e.g. Need sales helper for electronics shop',
    Hardware:    'e.g. Need helper for hardware store',
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
        <div className="p-5 bg-green-100 rounded-full text-green-600">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-text">Job Posted Successfully!</h2>
        <p className="text-gray-500">Redirecting to your job listings…</p>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Store size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-text">Post Helper Requirement</h1>
          <p className="text-gray-500 text-sm">Fill in the details to find a shop helper near you.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

        {/* Global submit error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
            {errors.submit}
          </div>
        )}

        {/* 1. Shop Type */}
        <div>
          <label className="block text-sm font-bold text-text mb-1">
            Shop Type <span className="text-red-500">*</span>
          </label>
          <select name="category" value={form.category} onChange={handleChange} className={inputCls('category')}>
            <option value="" disabled>Select shop type</option>
            {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldError field="category" />
        </div>

        {/* 2. Job Title */}
        <div>
          <label className="block text-sm font-bold text-text mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="title" value={form.title} onChange={handleChange}
            className={inputCls('title')}
            placeholder={placeholder[form.category] || 'e.g. Need a shop helper'}
          />
          <FieldError field="title" />
        </div>

        {/* 3. Description */}
        <div>
          <label className="block text-sm font-bold text-text mb-1">
            Description <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            rows={4} className={`${inputCls('description')} resize-none`}
            placeholder="Describe work responsibilities, any experience required, etc."
          />
        </div>

        {/* 4. Wage — stored as Number */}
        <div>
          <label className="block text-sm font-bold text-text mb-1">
            Wage (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
            <input
              type="number" name="budget" value={form.budget} onChange={handleChange}
              min="1"
              className={`${inputCls('budget')} pl-8`}
              placeholder="e.g. 8000"
            />
          </div>
          {form.budget > 0 && !errors.budget && (
            <p className="text-xs text-gray-400 mt-1">
              Preview: ₹{Number(form.budget).toLocaleString('en-IN')}
            </p>
          )}
          <FieldError field="budget" />
        </div>

        {/* 5. Work Duration */}
        <div>
          <label className="block text-sm font-bold text-text mb-1">
            Work Duration <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt} type="button"
                onClick={() => { setForm(p => ({ ...p, workDuration: opt })); setErrors(p => ({ ...p, workDuration: '' })); }}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  form.workDuration === opt
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <FieldError field="workDuration" />
        </div>

        {/* 6. Working Hours */}
        <div>
          <label className="block text-sm font-bold text-text mb-1">
            Working Hours <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="workingHours" value={form.workingHours} onChange={handleChange}
            className={inputCls('workingHours')} placeholder="e.g. 10 AM – 8 PM"
          />
          <FieldError field="workingHours" />
        </div>

        {/* 7 & 8. City + Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-text mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="city" value={form.city} onChange={handleChange}
              className={inputCls('city')} placeholder="e.g. Kanpur"
            />
            <FieldError field="city" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange}
              className={inputCls('contactNumber')} placeholder="+91XXXXXXXXXX"
            />
            <FieldError field="contactNumber" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity ${
            loading ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:opacity-90'
          }`}
        >
          {loading ? 'Posting…' : '📌 Post Helper Job'}
        </button>
      </form>
    </div>
  );
};

export default PostHelperJob;
