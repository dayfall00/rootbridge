import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { PlusCircle, PackageSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MyProducts = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'products'),
      where('ownerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt descending client-side to avoid composite index requirement
      list.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setProducts(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-text tracking-tight">{t('shop.product.my_products_title')}</h1>
          <p className="text-gray-500 font-body mt-2">
            {loading ? '—' : (products.length === 1 ? t('shop.product.my_products_subtitle', { count: products.length }) : t('shop.product.my_products_subtitle_plural', { count: products.length }))}
          </p>
        </div>
        <Link
          to="/artisan/add-product"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle size={18} />
          {t('shop.product.add_product')}
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                <div className="h-5 bg-gray-100 rounded-full w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center gap-4 text-center">
          <PackageSearch size={48} className="text-gray-300" />
          <p className="font-headline font-bold text-text text-xl">{t('shop.product.no_products')}</p>
          <p className="text-gray-500 text-sm">{t('shop.product.start_listing')}</p>
          <Link
            to="/artisan/add-product"
            className="mt-2 flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            <PlusCircle size={18} />
            {t('shop.product.add_first_product')}
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
