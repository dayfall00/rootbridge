import React, { useState } from 'react';
import { createJob } from '../services/jobService';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const JobModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title || !formData.description || !formData.category || !formData.budget) {
        throw new Error(t('feedback.error_require_all'));
      }

      await createJob({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: Number(formData.budget)
      });

      setFormData({ title: '', description: '', category: '', budget: '' });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || t('feedback.error_failed_job'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-text">{t('booking.job_modal_title')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto hidden-scrollbar space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-text mb-1">{t('common.category_label')}</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="" disabled>{t('booking.select_category')}</option>
              <option value="Plumbing">{t('categories.plumbing')}</option>
              <option value="Electrical">{t('categories.electrical')}</option>
              <option value="Carpentry">{t('categories.carpentry')}</option>
              <option value="Landscaping">{t('categories.gardening')}</option>
              <option value="Other">{t('categories.general_repair')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-1">{t('common.title_label')}</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-none"
              placeholder={
                formData.category === 'Electrical' ? t('booking.placeholder_elec') :
                formData.category === 'Plumbing' ? t('booking.placeholder_plumb') :
                formData.category === 'Carpentry' ? t('booking.placeholder_carp') :
                formData.category === 'Landscaping' ? t('booking.placeholder_land') :
                t('booking.placeholder_other')
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-1">{t('common.desc_label')}</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-none min-h-[100px]"
              placeholder={t('booking.placeholder_desc')}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-1">{t('booking.budget_label')}</label>
            <input 
              type="number" 
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="100.00"
              min="1"
              step="0.01"
            />
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 border border-gray-200 rounded-xl bg-white text-gray-600 font-bold hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2 bg-primary text-white rounded-xl font-bold transition-opacity ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {loading ? t('booking.posting') : t('booking.post_job')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
