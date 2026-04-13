import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Flame,
  Wind,
  TreePine,
  Layers,
  Sun,
  Wrench,
  HardHat,
  Home,
} from 'lucide-react';

// ── Static category definitions (extend or replace with Firestore fetch if needed) ──
const CATEGORIES = [
  { id: 'electrical',        name: 'Electrical',        icon: Zap,        color: '#F59E0B', bg: '#FEF3C7', skill: 'wiring' },
  { id: 'plumbing',          name: 'Plumbing',           icon: Droplets,   color: '#3B82F6', bg: '#DBEAFE', skill: 'pipe repair' },
  { id: 'carpentry',         name: 'Carpentry',          icon: Hammer,     color: '#92400E', bg: '#FDE68A', skill: 'furniture' },
  { id: 'painting',          name: 'Painting',           icon: Paintbrush, color: '#8B5CF6', bg: '#EDE9FE', skill: 'painting' },
  { id: 'welding',           name: 'Welding',            icon: Flame,      color: '#EF4444', bg: '#FEE2E2', skill: 'welding' },
  { id: 'ac-repair',         name: 'AC Repair',          icon: Wind,       color: '#06B6D4', bg: '#CFFAFE', skill: 'ac repair' },
  { id: 'gardening',         name: 'Gardening',          icon: TreePine,   color: '#10B981', bg: '#D1FAE5', skill: 'gardening' },
  { id: 'tiling',            name: 'Tiling',             icon: Layers,     color: '#6366F1', bg: '#E0E7FF', skill: 'tiling' },
  { id: 'solar',             name: 'Solar',              icon: Sun,        color: '#F97316', bg: '#FFEDD5', skill: 'solar installation' },
  { id: 'masonry',           name: 'Masonry',            icon: HardHat,    color: '#78716C', bg: '#F5F5F4', skill: 'masonry' },
  { id: 'general-repair',    name: 'General Repair',     icon: Wrench,     color: '#64748B', bg: '#F1F5F9', skill: '' },
  { id: 'interior',          name: 'Interior Work',      icon: Home,       color: '#EC4899', bg: '#FCE7F3', skill: '' },
];

// ── Skeleton card ────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-gray-200 mb-3" />
    <div className="h-3 w-16 bg-gray-200 rounded-full" />
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────────
const CategoryGrid = ({ loading = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCategoryClick = (cat) => {
    const params = new URLSearchParams();
    if (cat.skill) params.set('skill', cat.skill);
    params.set('category', cat.name);
    navigate(`/services?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            id={`category-${cat.id}`}
            onClick={() => handleCategoryClick(cat)}
            className="group flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100
                       hover:border-transparent hover:shadow-lg transition-all duration-200 cursor-pointer outline-none
                       focus-visible:ring-2 focus-visible:ring-primary/40"
            style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: cat.bg }}
            >
              <Icon size={22} style={{ color: cat.color }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 text-center leading-tight transition-colors">
              {t(`categories.${cat.id.replace('-', '_')}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
export { CATEGORIES };
