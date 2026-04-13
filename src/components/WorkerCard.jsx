import React from 'react';
import { Star, MapPin, Phone, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Helper – derive initials from a name string
const initials = (name = '') =>
  name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

// ── Skeleton variant ──────────────────────────────────────────────────────────
export const WorkerCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-2/3 bg-gray-200 rounded-full" />
      <div className="h-3 w-1/3 bg-gray-200 rounded-full" />
      <div className="flex gap-2 mt-2">
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-3 mt-4">
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Main WorkerCard ───────────────────────────────────────────────────────────
const WorkerCard = ({ worker, selectedSkill = '' }) => {
  const { t } = useTranslation();
  const normalize = (s) => (s || '').toLowerCase().trim();

  return (
    <div
      id={`worker-card-${worker.uid}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden
                 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* ── Image / Avatar ── */}
      <div className="relative h-44 overflow-hidden bg-gray-100 shrink-0">
        {worker.profileImage ? (
          <img
            src={worker.profileImage}
            alt={`${worker.name} – professional`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-3xl font-black text-primary font-headline select-none">
                {initials(worker.name)}
              </span>
            </div>
          </div>
        )}

        {/* Available badge */}
        <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
          <span className="text-[10px] font-bold text-white uppercase tracking-wide">{t('worker.available')}</span>
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Star fill="currentColor" size={12} className="text-amber-400" />
          <span className="text-xs font-bold text-gray-800">
            {worker.rating > 0 ? worker.rating.toFixed(1) : t('worker.new')}
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-headline font-bold text-text text-base leading-tight truncate flex-1 mr-2">
              {worker.name}
            </h3>
            {worker.ratePerHour && (
              <span className="text-primary font-black text-sm whitespace-nowrap">
                {t('worker.price_per_hour', { price: worker.ratePerHour })}
              </span>
            )}
          </div>

          {/* Location + distance */}
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
            <MapPin size={11} />
            <span className="capitalize truncate">
              {worker.city}
              {worker.distanceKm != null && (
                <span className="ml-1 text-primary font-semibold">
                  · {worker.distanceKm < 1
                    ? t('worker.distance_m', { distance: Math.round(worker.distanceKm * 1000) })
                    : t('worker.distance_km', { distance: worker.distanceKm.toFixed(1) })}
                </span>
              )}
            </span>
          </div>

          {/* Skill tags */}
          {worker.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {worker.skills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] capitalize font-semibold px-2 py-0.5 rounded-md border transition-colors
                    ${selectedSkill && normalize(skill) === normalize(selectedSkill)
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                >
                  {skill}
                </span>
              ))}
              {worker.skills.length > 4 && (
                <span className="text-[10px] text-gray-400 px-1 py-0.5">+{worker.skills.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-auto pt-3 border-t border-gray-50">
          <a
            href={`tel:${worker.phone}`}
            className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs
                       hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Phone size={14} />
            {t('worker.call')}
          </a>
          <button
            className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white font-semibold text-xs
                       hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <Zap size={14} />
            {t('worker.hire_now')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
