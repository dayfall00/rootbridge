import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat, MapPin, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import CategoryGrid from '../../components/CategoryGrid';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-12">
      <section>
        <div className="max-w-4xl">
          <h2 className="text-5xl font-extrabold font-headline text-text tracking-tight mb-4 leading-tight">
            Find professional help for your <span className="text-primary">home projects.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl">
            Connect with vetted local professionals and source premium architectural materials in one integrated ecosystem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
            <div className="col-span-2 flex items-center px-4 py-2 gap-3 border-b md:border-b-0 md:border-r border-gray-100">
              <HardHat className="text-primary shrink-0" size={20} />
              <input className="w-full border-none focus:ring-0 bg-transparent text-sm text-text placeholder:text-gray-400 outline-none" placeholder="What service do you need?" type="text"/>
            </div>
            <div className="flex items-center px-4 py-2 gap-3 border-b md:border-b-0 md:border-r border-gray-100">
              <MapPin className="text-primary shrink-0" size={20} />
              <input className="w-full border-none focus:ring-0 bg-transparent text-sm text-text placeholder:text-gray-400 outline-none" placeholder="Location" type="text"/>
            </div>
            <button className="bg-primary text-white py-3 md:py-2 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 mt-2 md:mt-0">
              Search Now
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold font-headline text-text">Browse by Category</h3>
            <p className="text-gray-500 text-sm mt-1">Professional services at your fingertips</p>
          </div>
          <Link to="/services" className="text-primary font-semibold text-sm hover:underline">View all</Link>
        </div>
        <CategoryGrid />
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold font-headline text-text">Nearby Workers</h3>
            <p className="text-gray-500 text-sm mt-1">Top-rated professionals in your area</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <HardHat className="mx-auto text-gray-400 mb-2 opacity-50" size={40} />
            <p className="text-gray-500 font-medium text-sm">Finding nearby professionals...</p>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold font-headline text-text">Featured Products</h3>
            <p className="text-gray-500 text-sm mt-1">Quality materials for your next renovation</p>
          </div>
          <Link to="/shop" className="text-primary font-semibold text-sm hover:underline">Go to Shop</Link>
        </div>
        <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <ShoppingBag className="mx-auto text-gray-400 mb-2 opacity-50" size={40} />
            <p className="text-gray-500 font-medium text-sm">Loading featured products...</p>
        </div>
      </section>

      <section className="hidden md:block">
        <div className="relative bg-primary/5 border border-primary/10 rounded-[2rem] overflow-hidden p-12 flex flex-col md:flex-row items-center gap-12">
          <div className="relative z-10 flex-1">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-6">Pro Subscription</span>
            <h3 className="text-4xl font-black font-headline mb-4 text-text">Unlimited assistance for your portfolio property.</h3>
            <p className="text-gray-700 text-lg mb-8 max-w-lg">Get priority booking, dedicated support, and 15% discount on all materials for a monthly flat fee.</p>
            <button className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm">Get Started Today</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
