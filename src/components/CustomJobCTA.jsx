import React from 'react';

const CustomJobCTA = ({ onClick }) => {
  return (
    <div className="p-6 rounded-2xl bg-primary text-white shadow-sm">
      <p className="text-sm font-medium mb-4 opacity-90 leading-relaxed">Looking for something specific?</p>
      <button 
        onClick={onClick}
        className="w-full py-3 bg-white/20 rounded-xl font-bold text-sm hover:bg-white/30 transition-all"
      >
        Post a Custom Job
      </button>
    </div>
  );
};

export default CustomJobCTA;
