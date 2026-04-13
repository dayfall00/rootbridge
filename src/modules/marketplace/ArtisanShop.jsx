import React, { useEffect, useState } from 'react';
import { subscribeToProducts } from '../../services/productService';
import { useUser } from '../../context/UserContext';
import { ShoppingCart, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ArtisanShop = () => {
  const { t } = useTranslation();
  const { userData } = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToProducts((productsList) => {
      setProducts(productsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto selection:bg-primary/20 selection:text-text pb-12">
      <section className="mb-12">
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-text tracking-tight mb-4">{t('marketplace.artisan_shop.title')}</h2>
        <p className="text-gray-500 max-w-2xl text-lg leading-relaxed">
          {t('marketplace.artisan_shop.subtitle')}
        </p>
      </section>

      {loading && <div className="p-10 border border-gray-200 rounded-2xl text-center shadow-sm bg-white animate-pulse text-primary font-bold mb-10">{t('marketplace.artisan_shop.loading')}</div>}
      
      {!loading && products.length === 0 && (
        <div className="p-10 border border-gray-200 rounded-2xl text-center bg-white shadow-sm mb-10">
          <p className="text-gray-500">{t('marketplace.artisan_shop.no_products')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product) => (
          <div key={product.productId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group hover:-translate-y-1">
            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 flex justify-center items-center">
              {product.imageUrl ? (
                <img 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={product.imageUrl}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-700">
                  <ImageIcon size={48} className="mb-3 opacity-50" />
                  <span className="text-sm font-semibold tracking-wider uppercase opacity-70">{t('marketplace.artisan_shop.img_coming_soon')}</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{t('marketplace.artisan_shop.limited_edition')}</span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <span className="font-label text-xs font-semibold text-gray-500 mb-1 uppercase tracking-widest">
                {product.ownerName || t('marketplace.artisan_shop.artisan_seller')}
              </span>
              <h3 className="font-headline text-xl font-bold text-text mb-6 line-clamp-2">{product.title}</h3>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-bold text-text">${Number(product.price).toFixed(2)}</span>
                <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 active:scale-95">
                  <ShoppingCart size={16} />
                  {t('marketplace.artisan_shop.add')}
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && products.length < 3 && (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col group opacity-60 grayscale blur-[1px]">
            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
              <img alt="Demo" className="w-full h-full object-cover transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1wINA76iTafYphCuijoonVcYQ1m5GBulnVdhko2wmiYl2PCUKNn0ScST8LBcQPLojxGNkFb2z-rcVJY3NNLsYcfXRcEK6UzbN-7iBFNtcOBHuSMF9EJAMcN7tEG1xTAbFPkQ9wtp5AEzAYAPvqTueUSMoFQY6Mj6sGqTkGsTYqUoi8pJlKs2uPC-bI_FLNGT4iCfKONoX4b7KVHpKUSI4QQ9W2d3b9ujcN63ssGEOKUd_jZ29-Y10U_T709mnFFVbw-Yzhrl891A" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <span className="font-label text-xs font-semibold text-gray-500 mb-1 uppercase tracking-widest">Elena Vance</span>
              <h3 className="font-headline text-xl font-bold text-text mb-6">Ribbed Terra Vessel (Sample)</h3>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-bold text-text">$124.00</span>
                <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm flex items-center gap-2 cursor-not-allowed">
                  <ShoppingCart size={16} />
                  {t('marketplace.artisan_shop.add')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && products.length > 0 && (
        <footer className="mt-20 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-bold">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronRight size={20} className="text-gray-500" />
            </button>
          </nav>
        </footer>
      )}
    </div>
  );
};

export default ArtisanShop;
