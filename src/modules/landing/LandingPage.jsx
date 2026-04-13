import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { ROLE_HOME } from '../../constants/routes';
import {
  ArrowRight, Zap, Shield, MapPin, Star, Users, Briefcase,
  Wrench, ShoppingBag, ChevronDown, Menu, X
} from 'lucide-react';
import CreditsSection from '../../components/CreditsSection';

const LandingPage = () => {
  const { currentUser, loading } = useAuth();
  const { userData }             = useUser();
  const navigate                 = useNavigate();

  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  // Scroll-aware navbar
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // If already logged in and has a role → skip landing page
  useEffect(() => {
    if (!loading && currentUser && userData?.primaryRole) {
      const dest = ROLE_HOME[userData.primaryRole];
      if (dest) navigate(dest, { replace: true });
    }
  }, [loading, currentUser, userData, navigate]);

  // Smooth scroll to section
  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const dashboardDest = userData?.primaryRole
    ? ROLE_HOME[userData.primaryRole]
    : '/redirect';

  const navLinks = [
    { label: 'What We Do', id: 'what-we-do' },
    { label: 'Features',   id: 'features'   },
    { label: 'How It Works', id: 'how-it-works' },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-body text-text overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-2xl font-headline font-black text-primary tracking-tight">RootBridge</span>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser && userData?.primaryRole ? (
              <Link
                to={dashboardDest}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors px-4 py-2">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left text-sm font-semibold text-gray-600 py-2 hover:text-primary transition-colors"
              >
                {label}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <Link
                to={currentUser && userData?.primaryRole ? dashboardDest : '/register'}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm"
              >
                {currentUser && userData?.primaryRole ? 'Dashboard' : 'Get Started'} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-primary/8 via-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-tertiary/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-primary/15">
            <Zap size={12} className="fill-current" />
            Hyperlocal Service Platform
          </div>

          <h1 className="font-headline text-5xl md:text-7xl font-black text-text leading-[1.05] tracking-tight mb-6">
            Connect Local.{' '}
            <span className="relative">
              <span className="text-primary">Work Smart.</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 9 Q75 2 150 9 Q225 16 298 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/30" />
              </svg>
            </span>
          </h1>

          <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
            RootBridge connects skilled workers, artisans, and shopkeepers with customers in their city —
            real-time job matching, verified profiles, and zero middlemen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-lg hover:border-primary hover:text-primary transition-all duration-200"
            >
              See How It Works
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            {[
              { icon: <Users size={16} />,    text: '500+ Workers' },
              { icon: <Star size={16} />,     text: '4.8 Avg Rating' },
              { icon: <MapPin size={16} />,   text: '12 Cities' },
              { icon: <Shield size={16} />,   text: 'Verified Profiles' },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 font-semibold">
                <span className="text-primary">{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="flex justify-center mt-16 animate-bounce">
          <ChevronDown size={24} className="text-gray-300" />
        </div>
      </section>

      {/* ── WHAT WE DO ──────────────────────────────────────────────────── */}
      <section id="what-we-do" className="py-24 px-6 bg-gray-50/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-3">What We Do</p>
            <h2 className="font-headline text-4xl md:text-5xl font-black text-text">
              One platform. Four superpowers.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon:  <Wrench size={28} />,
                color: 'bg-blue-50 text-blue-600',
                title: 'Workers',
                desc:  'Electricians, plumbers, painters — find skilled workers in your city within minutes.',
              },
              {
                icon:  <ShoppingBag size={28} />,
                color: 'bg-purple-50 text-purple-600',
                title: 'Artisans',
                desc:  'Handmade jewelry, crafts, home décor — discover unique local artisan products.',
              },
              {
                icon:  <Briefcase size={28} />,
                color: 'bg-amber-50 text-amber-600',
                title: 'Shopkeepers',
                desc:  'Post helper jobs for your shop, manage workers, and review completed tasks.',
              },
              {
                icon:  <Users size={28} />,
                color: 'bg-green-50 text-green-600',
                title: 'Customers',
                desc:  'Browse, book, and rate services — all from a single dashboard built for you.',
              },
            ].map(({ icon, color, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="font-headline font-black text-xl text-text mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-3">Features</p>
            <h2 className="font-headline text-4xl md:text-5xl font-black text-text">
              Built for the ground reality
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: '🗺️',
                title: 'City-Based Matching',
                desc:  'Workers and customers are matched by city automatically — no manual filtering needed.',
              },
              {
                emoji: '🔐',
                title: 'Verified Profiles',
                desc:  'Phone-number authentication ensures every user on the platform is a real person.',
              },
              {
                emoji: '⚡',
                title: 'Real-Time Updates',
                desc:  'Job status, availability, and ratings update live — powered by Firebase Firestore.',
              },
              {
                emoji: '🧭',
                title: 'Role-Based Dashboards',
                desc:  'Each role gets a custom dashboard — workers, artisans, shopkeepers, and customers.',
              },
              {
                emoji: '📸',
                title: 'Persistent Profiles',
                desc:  'Upload your profile photo once; it persists across the entire platform via Cloudinary.',
              },
              {
                emoji: '⭐',
                title: 'Rating & Reviews',
                desc:  'Customers rate workers after job completion — building trust through transparency.',
              },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="p-7 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
              >
                <span className="text-4xl block mb-4">{emoji}</span>
                <h3 className="font-headline font-black text-lg text-text mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="font-headline text-4xl md:text-5xl font-black text-text">
              Up and running in 3 steps
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Sign Up & Choose Your Role',
                desc:  'Create your account with your phone number. Then select whether you\'re a customer, worker, artisan, or shopkeeper.',
                color: 'bg-primary text-white',
              },
              {
                step: '02',
                title: 'Complete Your Profile',
                desc:  'Add your city, skills, and profile photo. Workers set their availability and categories so customers can find them.',
                color: 'bg-secondary text-white',
              },
              {
                step: '03',
                title: 'Connect & Earn',
                desc:  'Customers browse and book. Workers accept jobs. Artisans list products. Shopkeepers post helper jobs. Everyone wins.',
                color: 'bg-tertiary text-white',
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex gap-6 items-start bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
                <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-headline font-black text-xl`}>
                  {step}
                </div>
                <div>
                  <h3 className="font-headline font-black text-xl text-text mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
          <h2 className="font-headline text-4xl md:text-5xl font-black text-white mb-4 relative z-10">
            Ready to bridge the gap?
          </h2>
          <p className="text-white/80 text-lg mb-8 relative z-10">
            Join thousands of workers and customers already on RootBridge.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-white text-primary font-black text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative z-10"
          >
            Join RootBridge <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER / CREDITS ────────────────────────────────────────────── */}
      <CreditsSection />
    </div>
  );
};

export default LandingPage;
