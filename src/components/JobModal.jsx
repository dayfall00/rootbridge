import React, { useState } from 'react';
import { createJob } from '../services/jobService';
import { X } from 'lucide-react';

const JobModal = ({ isOpen, onClose }) => {
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
        throw new Error('All fields are required');
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
      setError(err.message || 'Failed to create job');
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
          <h2 className="text-xl font-bold text-text">Post a Custom Job</h2>
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
            <label className="block text-sm font-bold text-text mb-1">Job Title</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="e.g., Fix leaking pipe"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-1">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-none min-h-[100px]"
              placeholder="Describe what needs to be done..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-1">Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="" disabled>Select category</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Landscaping">Landscaping</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-1">Budget ($)</label>
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
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2 bg-primary text-white rounded-xl font-bold transition-opacity ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
