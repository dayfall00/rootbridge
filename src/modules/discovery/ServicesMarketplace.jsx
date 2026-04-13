import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Star, Phone, Zap, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import CustomJobCTA from '../../components/CustomJobCTA';
import JobModal from '../../components/JobModal';
import { useTranslation } from 'react-i18next';

const SKILL_OPTIONS = [
  'wiring',
  'pipe repair',
  'furniture',
  'gardening',
  'welding',
  'painting',
  'tiling',
  'masonry',
  'ac repair',
  'solar installation',
];

const RATING_OPTIONS = [
  { label: 'All',      value: 0   },
  { label: '3+ ⭐',   value: 3   },
  { label: '4+ ⭐',   value: 4   },
  { label: '4.5+ ⭐', value: 4.5 },
];

const normalize = (str) => (str || '').toLowerCase().trim();

const ServicesMarketplace = () => {
  const { t } = useTranslation();
  const { userData } = useUser();
  const [searchParams] = useSearchParams();

  const [workersData, setWorkersData]         = useState([]);
  const [displayedWorkers, setDisplayedWorkers] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [isModalOpen, setIsModalOpen]         = useState(false);

  // Seed from URL params (skill from CategoryGrid, q from HeroSearch)
  const [selectedSkill, setSelectedSkill] = useState(
    () => searchParams.get('skill') || searchParams.get('q') || ''
  );
  const [minRating, setMinRating]         = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');

    const userCity = userData?.city?.trim();
    const targetCity = normalize(userCity);
    console.log('[ServicesMarketplace] User city:', userCity, '→ normalized:', targetCity);

    if (!userCity) {
      // No city set on user profile yet — show all available workers as fallback
      console.log('[ServicesMarketplace] No user city — showing all available workers');
    }

    const q = query(
      collection(db, 'workers'),
      where('isAvailable', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        let raw = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
        console.log('[ServicesMarketplace] Firestore isAvailable workers:', raw.length);

        // Try city filter first
        let cityFiltered = raw;
        if (targetCity) {
          cityFiltered = raw.filter(w => {
            const match = normalize(w.city) === targetCity;
            console.log(`[Worker ${w.uid}] city="${w.city}" → "${normalize(w.city)}" vs "${targetCity}" → ${match}`);
            return match;
          });
        }

        // FALLBACK: if no city match, show all available workers
        const toEnrich = cityFiltered.length > 0 ? cityFiltered : raw;
        if (cityFiltered.length === 0 && raw.length > 0) {
          console.log('[ServicesMarketplace] No city match → fallback: showing all', raw.length, 'workers');
        }

        const enriched = await Promise.all(
          toEnrich.map(async (worker) => {
            let name  = 'RootBridge User';
            let phone = '+';
            let profileImage = worker.profileImage || '';
            try {
              const userDoc = await getDoc(doc(db, 'users', worker.uid));
              if (userDoc.exists()) {
                const ud = userDoc.data();
                name         = ud.name         || name;
                phone        = ud.phone        || phone;
                profileImage = worker.profileImage || ud.profileImage || ud.avatar || '';
              }
            } catch (err) {
              console.error('[ServicesMarketplace] Error fetching user doc:', worker.uid, err);
            }

            let skills = [];
            if (Array.isArray(worker.skills)) {
              skills = worker.skills;
            } else if (typeof worker.skills === 'string') {
              skills = worker.skills.split(',').map(s => s.trim()).filter(Boolean);
            }

            return {
              uid:           worker.uid,
              name,
              skills,
              rating:        typeof worker.rating === 'number' ? worker.rating : 0,
              city:          worker.city || userCity || '',
              isAvailable:   true,
              phone,
              profileImage,
              completedJobs: worker.completedJobs || 0,
            };
          })
        );

        console.log('[ServicesMarketplace] Filtered & enriched workers:', enriched.length);
        setWorkersData(enriched);
        setLoading(false);
      },
      (err) => {
        console.error('[ServicesMarketplace] Firestore snapshot error:', err);
        setError('Failed to load workers. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.city]);

  useEffect(() => {
    let result = workersData;

    if (selectedSkill) {
      const target = normalize(selectedSkill);
      result = result.filter(w =>
        w.skills.some(s => normalize(s) === target)
      );
    }

    if (minRating > 0) {
      result = result.filter(w => w.rating >= minRating);
    }

    console.log(
      `[ServicesMarketplace] Filters — skill:"${selectedSkill}" minRating:${minRating}`,
      '→ displayed:', result.length
    );

    setDisplayedWorkers(result);
  }, [workersData, selectedSkill, minRating]);

  const activeFilterCount = [selectedSkill, minRating > 0].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedSkill('');
    setMinRating(0);
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex gap-10 selection:bg-primary/20 selection:text-text">

      <aside className="w-72 flex-shrink-0 hidden md:block">
        <div className="sticky top-6 space-y-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" />
              <h3 className="text-lg font-bold font-headline text-text">{t('marketplace.filters')}</h3>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} /> {t('marketplace.clear_all')}
              </button>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          <div className="space-y-3">
            <label className="text-xs font-bold font-label text-gray-400 uppercase tracking-wider">
              {t('marketplace.work_field')}
            </label>
            <div className="relative">
              <select
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-sm text-text
                           rounded-xl px-4 py-2.5 pr-8 cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                           hover:border-primary/50 transition-colors capitalize"
              >
                <option value="">{t('marketplace.all_skills')}</option>
                {SKILL_OPTIONS.map(skill => (
                  <option key={skill} value={skill} className="capitalize">{skill}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {selectedSkill && (
              <button
                onClick={() => setSelectedSkill('')}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <X size={10} /> {t('marketplace.clear')}
              </button>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          <div className="space-y-3">
            <label className="text-xs font-bold font-label text-gray-400 uppercase tracking-wider">
              {t('marketplace.min_rating')}
            </label>
            <div className="relative">
              <select
                value={minRating}
                onChange={e => setMinRating(Number(e.target.value))}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-sm text-text
                           rounded-xl px-4 py-2.5 pr-8 cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                           hover:border-primary/50 transition-colors"
              >
                {RATING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {minRating > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < Math.floor(minRating) ? 'currentColor' : 'none'}
                    className={i < Math.floor(minRating) ? 'text-amber-400' : 'text-gray-300'}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">{t('marketplace.and_above')}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          <CustomJobCTA onClick={() => setIsModalOpen(true)} />
        </div>
      </aside>

      <section className="flex-1">

        <div className="mb-8">
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-text mb-2">
            {t('marketplace.available_workers')}
          </h2>
          <div className="flex items-center gap-2 text-gray-500 text-lg">
            <MapPin size={18} className="text-primary" />
            <span>
              <span className="font-semibold text-text">{displayedWorkers.length}</span>{' '}
              professional{displayedWorkers.length !== 1 ? 's' : ''} available in{' '}
              <span className="font-semibold capitalize text-text">
                {userData?.city || 'your area'}
              </span>
            </span>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedSkill && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
                🔧 {selectedSkill}
                <button onClick={() => setSelectedSkill('')} className="hover:text-primary/60 transition-colors">
                  <X size={10} />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                ★ {minRating}+ stars
                <button onClick={() => setMinRating(0)} className="hover:text-amber-400 transition-colors">
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="p-10 border border-gray-200 rounded-2xl text-center bg-white shadow-sm">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">{t('marketplace.loading_workers')}</p>
          </div>
        )}

        {!loading && displayedWorkers.length === 0 && (
          <div className="p-12 border border-gray-200 rounded-2xl text-center bg-white shadow-sm">
            <p className="text-gray-400 text-2xl mb-2">🔍</p>
            <p className="text-gray-600 font-semibold text-base">{t('marketplace.no_workers_found')}</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeFilterCount > 0
                ? t('marketplace.try_removing_filters')
                : t('marketplace.no_workers_fallback', { city: userData?.city || 'your area' })}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 text-sm text-primary font-semibold hover:underline"
              >
                {t('marketplace.clear_all')}
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {displayedWorkers.map((worker) => (
            <div
              key={worker.uid}
              className="group bg-white rounded-[2rem] overflow-hidden transition-all hover:-translate-y-1 shadow-sm hover:shadow-xl border border-gray-100"
            >
              <div className="relative h-64 overflow-hidden bg-gray-100">
                {worker.profileImage ? (
                  <img
                    alt={`${worker.name} – professional worker`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={worker.profileImage}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-4xl font-black text-primary font-headline select-none">
                        {worker.name ? worker.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Available Now</span>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star fill="currentColor" size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-text tracking-tight">
                    {worker.rating > 0 ? worker.rating.toFixed(1) : 'New'}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold font-headline text-text mb-1 truncate">
                      {worker.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                      <MapPin size={12} />
                      <span className="capitalize">{worker.city}</span>
                    </div>

                    {worker.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {worker.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] capitalize font-bold px-2 py-1 rounded-md border shadow-sm transition-colors
                              ${selectedSkill && normalize(skill) === normalize(selectedSkill)
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Completed
                    </p>
                    <p className="text-lg font-black text-text">{worker.completedJobs}</p>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Available for hire in{' '}
                  <span className="capitalize font-medium">{worker.city}</span>.
                  Connect directly without any middlemen.
                </p>

                <div className="flex gap-4">
                  <a
                    href={`tel:${worker.phone}`}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    Call Now
                  </a>
                  <button className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
                    <Zap size={18} />
                    Hire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ServicesMarketplace;
