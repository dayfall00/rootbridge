import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { db } from '../../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { PlusCircle, Package, LayoutDashboard } from 'lucide-react';

const ArtisanDashboard = () => {
  const { currentUser } = useAuth();
  const { userData } = useUser();
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'products'),
      where('ownerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setProductCount(snap.size);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-headline font-extrabold text-text tracking-tight">Artisan Dashboard</h1>
        <p className="text-gray-500 font-body mt-2">Welcome back, {userData?.name || 'Artisan'}. Manage your storefront.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Products</p>
            <p className="text-3xl font-black text-text font-headline">{loading ? '—' : productCount}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/artisan/add-product"
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <PlusCircle size={24} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-text text-lg">Add Product</h3>
            <p className="text-sm text-gray-500 mt-1">List a new product in your store.</p>
          </div>
        </Link>

        <Link
          to="/artisan/products"
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Package size={24} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-text text-lg">My Products</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage your listed products.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ArtisanDashboard;
