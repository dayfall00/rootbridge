import React from 'react';
import { Tag } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 overflow-hidden bg-gray-100">
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
      <div className="p-5">
        <h3 className="font-headline font-bold text-text text-lg leading-tight mb-1 line-clamp-1">{product.title}</h3>
        <p className="text-primary font-black text-xl mt-2">₹{Number(product.price).toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

export default ProductCard;
