import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Helper: derive initials from a name string
const initials = (name = '') =>
  name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const ProductCard = ({ product }) => {
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    if (!product.ownerId) return;
    let cancelled = false;

    const load = async () => {
      try {
        // Try artisans collection first, fall back to users
        const artisanSnap = await getDoc(doc(db, 'artisans', product.ownerId));
        if (!cancelled) {
          if (artisanSnap.exists()) {
            const d = artisanSnap.data();
            const userSnap = await getDoc(doc(db, 'users', product.ownerId));
            const userName = userSnap.exists() ? userSnap.data().name : '';
            setSeller({ profileImage: d.profileImage || '', name: d.shopName || userName || '' });
          } else {
            const userSnap = await getDoc(doc(db, 'users', product.ownerId));
            if (userSnap.exists()) {
              const d = userSnap.data();
              setSeller({ profileImage: d.profileImage || d.avatar || '', name: d.name || '' });
            }
          }
        }
      } catch (_) { /* silently ignore */ }
    };

    load();
    return () => { cancelled = true; };
  }, [product.ownerId]);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Product image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={40} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-primary/20">
          {product.category || 'Uncategorized'}
        </div>
      </div>

      {/* Product info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-headline font-bold text-text text-lg leading-tight mb-1 line-clamp-1">{product.title}</h3>
          <p className="text-primary font-black text-xl mt-2">₹{Number(product.price).toLocaleString('en-IN')}</p>
        </div>

        {/* Seller strip */}
        {seller !== null && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
            {seller.profileImage ? (
              <img
                src={seller.profileImage}
                alt={seller.name || 'Seller'}
                className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-primary leading-none">{initials(seller.name)}</span>
              </div>
            )}
            <span className="text-xs font-semibold text-gray-500 truncate">{seller.name || 'Artisan'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
