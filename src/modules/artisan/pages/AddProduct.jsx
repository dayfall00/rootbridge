import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '../../../services/uploadService';
import { Upload, CheckCircle } from 'lucide-react';

const CATEGORIES = ['Handicraft', 'Jewelry', 'Clothing', 'Home Decor', 'Food & Spices', 'Art', 'Other'];

const AddProduct = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB.', 'error');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !price || !category) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }
    if (!imageFile) {
      showToast('Please select a product image.', 'error');
      return;
    }

    setSaving(true);

    try {
      // Step 1: Upload image to Cloudinary first
      const imageUrl = await uploadToCloudinary(imageFile);

      // Step 2: Write to Firestore only after upload succeeds
      await addDoc(collection(db, 'products'), {
        ownerId: currentUser.uid,
        title: title.trim(),
        price: Number(price),
        category,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setTitle('');
      setPrice('');
      setCategory('');
      setImageFile(null);
      setImagePreview(null);

      showToast('Product listed successfully!', 'success');
      setTimeout(() => navigate('/artisan/my-products'), 1500);

    } catch (err) {
      console.error("Product upload error:", err);
      showToast(err.message || 'Failed to add product. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-extrabold text-text tracking-tight">Add Product</h1>
        <p className="text-gray-500 font-body mt-2">List a new product in your artisan store.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Product Image <span className="text-red-500">*</span>
            </label>
            <label
              htmlFor="productImage"
              className={`flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${imagePreview ? 'border-primary' : 'border-gray-200 hover:border-primary'} bg-gray-50 overflow-hidden`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={28} />
                  <span className="text-sm font-medium">Click to upload image</span>
                  <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
                </div>
              )}
            </label>
            <input
              id="productImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={saving}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hand-woven Bamboo Basket"
              disabled={saving}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-60"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 499"
              min="1"
              disabled={saving}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-60"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={saving}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-60"
              required
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/artisan')}
              disabled={saving}
              className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-md transition-all ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              {saving ? 'Uploading...' : 'List Product'}
            </button>
          </div>
        </form>
      </div>

      {toast.show && (
        <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AddProduct;
