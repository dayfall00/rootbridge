import React from 'react';
import { useTranslation } from 'react-i18next';

const CustomJobCTA = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <div className="p-6 rounded-2xl bg-primary text-white shadow-sm">
      <p className="text-sm font-medium mb-4 opacity-90 leading-relaxed">{t('booking.custom_job_cta_title')}</p>
      <button 
        onClick={onClick}
        className="w-full py-3 bg-white/20 rounded-xl font-bold text-sm hover:bg-white/30 transition-all"
      >
        {t('booking.custom_job_cta_btn')}
      </button>
    </div>
  );
};

export default CustomJobCTA;
