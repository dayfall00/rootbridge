import React, { useState, useEffect } from 'react';
import { Component, HardHat } from 'lucide-react'; // Placeholder icons

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock async fetch for categories
    let isMounted = true;
    
    const fetchCategories = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (!isMounted) return;
        
        setCategories([
          { id: '1', name: 'Plumbing', icon: <HardHat size={24} /> },
          { id: '2', name: 'Electrical', icon: <Component size={24} /> },
          { id: '3', name: 'Carpentry', icon: <HardHat size={24} /> },
          { id: '4', name: 'Painting', icon: <Component size={24} /> },
          { id: '5', name: 'Masonry', icon: <HardHat size={24} /> },
          { id: '6', name: 'Architecture', icon: <Component size={24} /> },
        ]);
      } catch (err) {
        console.error("Error loading categories", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="col-span-full py-12 text-center border border-dashed border-gray-200 rounded-2xl animate-pulse">
            <Component className="mx-auto text-gray-400 text-4xl mb-2 opacity-50" size={40} />
            <p className="text-gray-500 font-medium text-sm">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="col-span-full py-12 text-center border border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500 font-medium text-sm">No categories found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((category) => (
        <button 
            key={category.id}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group"
        >
          <div className="text-gray-400 group-hover:text-primary transition-colors mb-3">
             {category.icon}
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-primary">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
