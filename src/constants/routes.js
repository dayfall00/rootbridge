// ─── Route Prefixes ───────────────────────────────────────────────────────────
export const ROUTES = {
  // Public
  LANDING:            '/',
  LOGIN:              '/login',
  REGISTER:           '/register',
  VERIFY_OTP:         '/verify-otp',
  REDIRECT:           '/redirect',
  ONBOARDING_ROLE:    '/onboarding/role',
  ONBOARDING_PROFILE: '/onboarding/profile',

  // Customer
  HOME:     '/home',
  SERVICES: '/services',
  SHOP:     '/shop',
  PROFILE:  '/profile',

  // Worker
  WORKER:            '/worker',
  WORKER_JOBS:       '/worker/jobs',
  WORKER_MY_JOBS:    '/worker/my-jobs',
  WORKER_PROFILE:    '/worker/profile',

  // Artisan
  ARTISAN:             '/artisan',
  ARTISAN_ADD_PRODUCT: '/artisan/add-product',
  ARTISAN_PRODUCTS:    '/artisan/products',
  ARTISAN_PROFILE:     '/artisan/profile',

  // Business / Shopkeeper
  BUSINESS:          '/business',
  BUSINESS_POST_JOB: '/business/post-job',
  BUSINESS_MY_JOBS:  '/business/my-jobs',
  BUSINESS_PROFILE:  '/business/profile',
};

// Convenience: role → home route mapping
export const ROLE_HOME = {
  worker:     ROUTES.WORKER,
  artisan:    ROUTES.ARTISAN,
  business:   ROUTES.BUSINESS,
  shopkeeper: ROUTES.BUSINESS,
  customer:   ROUTES.HOME,
};

// Convenience: role → profile route mapping
export const ROLE_PROFILE = {
  worker:     ROUTES.WORKER_PROFILE,
  artisan:    ROUTES.ARTISAN_PROFILE,
  business:   ROUTES.BUSINESS_PROFILE,
  shopkeeper: ROUTES.BUSINESS_PROFILE,
  customer:   ROUTES.PROFILE,
};
