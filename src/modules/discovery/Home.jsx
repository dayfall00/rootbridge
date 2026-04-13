import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Loader2,
  HardHat,
  ShoppingBag,
  ChevronRight,
  AlertCircle,
  X,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, getDoc, doc, limit, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useUser } from '../../context/UserContext';
import CategoryGrid from '../../components/CategoryGrid';
import WorkerCard, { WorkerCardSkeleton } from '../../components/WorkerCard';
import ProductCard from '../artisan/components/ProductCard';

// ── Service autocomplete suggestions ────────────────────────────────────────
const SERVICE_SUGGESTIONS = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Repair',
  'Welder', 'Tiler', 'Mason', 'Gardener', 'Solar Installation',
  'Furniture Assembly', 'Home Cleaning', 'Wall Drilling', 'Tile Grouting',
];

// ── Haversine distance calculator ────────────────────────────────────────────
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO SEARCH
// ─────────────────────────────────────────────────────────────────────────────
const HeroSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query_text, setQueryText] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Autocomplete filtering
  useEffect(() => {
    if (!query_text.trim()) { setSuggestions([]); return; }
    const q = query_text.toLowerCase();
    setSuggestions(
      SERVICE_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 6)
    );
    setShowDropdown(true);
  }, [query_text]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocError(t('home.geolocation_unsupported'));
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Your location';
          setLocation(city);
        } catch {
          setLocation('Location detected');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocError(t('home.detect_location_error'));
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query_text.trim()) params.set('q', query_text.trim());
    if (location.trim()) params.set('city', location.trim());
    navigate(`/services?${params.toString()}`);
  };

  const applySuggestion = (s) => {
    setQueryText(s);
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-0 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-visible">
        {/* Service input */}
        <div className="relative flex-1 flex items-center px-4 py-3 gap-3 border-b sm:border-b-0 sm:border-r border-gray-100">
          <Search className="text-primary shrink-0" size={18} />
          <div className="relative w-full">
            <input
              ref={inputRef}
              id="hero-search-input"
              type="text"
              value={query_text}
              onChange={(e) => setQueryText(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder={t('home.search_placeholder')}
              autoComplete="off"
              className="w-full border-none focus:ring-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
            {query_text && (
              <button
                type="button"
                onClick={() => { setQueryText(''); setSuggestions([]); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X size={14} />
              </button>
            )}
            {/* Autocomplete dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => applySuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Search size={13} className="text-gray-400" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Location input */}
        <div className="flex items-center px-4 py-3 gap-3 border-b sm:border-b-0 sm:border-r border-gray-100 sm:w-52">
          <MapPin className="text-primary shrink-0" size={18} />
          <input
            id="hero-location-input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('home.city_placeholder')}
            className="w-full border-none focus:ring-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          />
          <button
            type="button"
            onClick={detectLocation}
            title={t('home.city_placeholder')}
            className="text-gray-400 hover:text-primary transition-colors shrink-0"
          >
            {locating ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : (
              <MapPin size={16} />
            )}
          </button>
        </div>

        {/* Search button */}
        <button
          id="hero-search-btn"
          type="submit"
          className="bg-primary text-white px-6 py-3 font-bold text-sm transition-opacity hover:opacity-90 rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl shrink-0"
        >
          {t('home.search_button')}
        </button>
      </div>
      {locError && (
        <p className="text-xs text-red-500 mt-2 ml-1 flex items-center gap-1">
          <AlertCircle size={12} /> {locError}
        </p>
      )}
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NEARBY WORKERS SECTION
// ─────────────────────────────────────────────────────────────────────────────
const useNearbyWorkers = (userCity) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalize = (s) => (s || '').toLowerCase().trim();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(
        collection(db, 'workers'),
        where('isAvailable', '==', true),
        limit(8)
      );
      const snapshot = await getDocs(q);
      let raw = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));

      // Best-effort city filter then fallback to all
      const targetCity = normalize(userCity);
      let filtered = targetCity
        ? raw.filter((w) => normalize(w.city) === targetCity)
        : raw;
      if (filtered.length === 0) filtered = raw;

      // Enrich with user profile data
      const enriched = await Promise.all(
        filtered.map(async (worker) => {
          let name = 'RootBridge Worker';
          let phone = '';
          let profileImage = worker.profileImage || '';
          try {
            const userSnap = await getDoc(doc(db, 'users', worker.uid));
            if (userSnap.exists()) {
              const ud = userSnap.data();
              name = ud.name || name;
              phone = ud.phone || phone;
              profileImage = worker.profileImage || ud.profileImage || ud.avatar || '';
            }
          } catch (_) {}

          const skills = Array.isArray(worker.skills)
            ? worker.skills
            : typeof worker.skills === 'string'
            ? worker.skills.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

          return {
            uid: worker.uid,
            name,
            skills,
            rating: typeof worker.rating === 'number' ? worker.rating : 0,
            city: worker.city || userCity || '',
            phone,
            profileImage,
            ratePerHour: worker.ratePerHour || null,
            completedJobs: worker.completedJobs || 0,
            distanceKm: null, // calculated below if coords available
          };
        })
      );

      setWorkers(enriched.slice(0, 6));
    } catch (err) {
      console.error('[Home] Nearby workers error:', err);
      setError('Could not load nearby workers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userCity]);

  useEffect(() => { fetch(); }, [fetch]);

  return { workers, loading, error, refetch: fetch };
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED PRODUCTS SECTION
// ─────────────────────────────────────────────────────────────────────────────
const useFeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), limit(6));
        const snap = await getDocs(q);
        if (!cancelled) {
          setProducts(snap.docs.map((d) => ({ productId: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error('[Home] Products error:', err);
        if (!cancelled) setError('Could not load products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <h3 className="text-2xl font-bold font-headline text-text">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────
const Home = () => {
  const { t } = useTranslation();
  const { userData } = useUser();
  const navigate = useNavigate();

  const { workers, loading: wLoad, error: wError, refetch: wRefetch } =
    useNearbyWorkers(userData?.city);
  const { products, loading: pLoad, error: pError } = useFeaturedProducts();

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-16">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-2">
        <div className="max-w-4xl">
          <h2 className="text-5xl font-extrabold font-headline text-text tracking-tight mb-3 leading-tight">
            {t('home.hero_title_1')}{' '}
            <span className="text-primary">{t('home.hero_title_highlight')}</span>
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl">
            {t('home.hero_subtitle')}
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          title={t('home.browse_categories')}
          subtitle={t('home.categories_subtitle')}
          action={
            <Link
              to="/services"
              className="text-primary font-semibold text-sm hover:underline flex items-center gap-1"
            >
              {t('home.view_all')} <ChevronRight size={14} />
            </Link>
          }
        />
        <CategoryGrid />
      </section>

      {/* ── NEARBY WORKERS ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          title={t('home.nearby_workers')}
          subtitle={
            userData?.city
              ? t('home.top_rated_in_city', { city: userData.city })
              : t('home.top_rated_in_area')
          }
          action={
            <Link
              to="/services"
              className="text-primary font-semibold text-sm hover:underline flex items-center gap-1"
            >
              {t('home.view_all')} <ChevronRight size={14} />
            </Link>
          }
        />

        {/* Loading skeletons */}
        {wLoad && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <WorkerCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!wLoad && wError && (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-red-200 rounded-2xl bg-red-50 text-center">
            <AlertCircle className="text-red-400 mb-2" size={36} />
            <p className="text-red-600 font-medium text-sm">{wError}</p>
            <button
              onClick={wRefetch}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              {t('home.try_again')}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!wLoad && !wError && workers.length === 0 && (
          <div className="py-14 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center">
            <HardHat className="text-gray-300 mb-3" size={44} />
            <p className="text-gray-600 font-semibold text-base">{t('home.no_workers')}</p>
            <p className="text-gray-400 text-sm mt-1">
              {t('home.no_workers_desc')}
            </p>
            <Link
              to="/services"
              className="mt-4 text-sm text-primary font-semibold hover:underline"
            >
              {t('home.browse_all_workers')}
            </Link>
          </div>
        )}

        {/* Worker grid */}
        {!wLoad && !wError && workers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workers.map((worker) => (
              <WorkerCard key={worker.uid} worker={worker} />
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURED PRODUCTS ──────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          title={t('home.featured_products')}
          subtitle={t('home.quality_materials')}
          action={
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              {t('home.go_to_shop')} <ArrowRight size={14} />
            </Link>
          }
        />

        {/* Loading skeletons for products */}
        {pLoad && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!pLoad && pError && (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-red-200 rounded-2xl bg-red-50 text-center">
            <AlertCircle className="text-red-400 mb-2" size={36} />
            <p className="text-red-600 font-medium text-sm">{pError}</p>
          </div>
        )}

        {/* Empty state */}
        {!pLoad && !pError && products.length === 0 && (
          <div className="py-14 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center">
            <ShoppingBag className="text-gray-300 mb-3" size={44} />
            <p className="text-gray-600 font-semibold text-base">{t('home.no_products')}</p>
            <p className="text-gray-400 text-sm mt-1">
              {t('home.no_products_desc')}
            </p>
            <Link to="/shop" className="mt-4 text-sm text-primary font-semibold hover:underline">
              {t('home.browse_shop')}
            </Link>
          </div>
        )}

        {/* Product grid */}
        {!pLoad && !pError && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── PRO CTA ────────────────────────────────────────────────────────── */}
      <section className="hidden md:block">
        <div className="relative bg-gradient-to-br from-primary/5 via-white to-primary/10 border border-primary/15 rounded-[2rem] overflow-hidden p-12 flex flex-col md:flex-row items-center gap-12">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 right-32 w-40 h-40 bg-primary/8 rounded-full pointer-events-none" />

          <div className="relative z-10 flex-1">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-5">
              {t('home.pro_subscription')}
            </span>
            <h3 className="text-4xl font-black font-headline mb-4 text-text">
              {t('home.pro_title')}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-lg leading-relaxed">
              {t('home.pro_desc')}
            </p>
            <div className="flex items-center gap-6">
              <button className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-opacity shadow-md">
                {t('home.get_started')}
              </button>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} fill="currentColor" className="text-amber-400" />
                ))}
                <span className="text-xs text-gray-500 ml-1">4.9 from 2,400+ users</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
