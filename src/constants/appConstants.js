// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  CUSTOMER:   'customer',
  WORKER:     'worker',
  ARTISAN:    'artisan',
  BUSINESS:   'business',
  SHOPKEEPER: 'shopkeeper', // legacy alias for business
};

// ─── Firestore Collections ────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS:      'users',
  WORKERS:    'workers',
  ARTISANS:   'artisans',
  BUSINESSES: 'businesses',
  JOBS:       'jobs',
  PRODUCTS:   'products',
  REVIEWS:    'reviews',
};

// ─── Worker Categories ────────────────────────────────────────────────────────
export const CATEGORIES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Cleaner',
];
