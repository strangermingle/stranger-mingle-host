export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAIL: (slug: string) => `/events/${slug}`,
  CATEGORY: (slug: string) => `/category/${slug}`,
  SEARCH: '/search',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  MEMBERS: {
    DASHBOARD: '/',
    PROFILE: '/profile',
    BOOKINGS: '/bookings',
    NOTIFICATIONS: '/notifications',
    SAVED_EVENTS: '/saved-events',
    SETTINGS: '/settings/notifications',
  },
  HOST: {
    DASHBOARD: '/host-dashboard',
    CREATE_EVENT: '/host-dashboard/create-event',
    EVENTS: '/host-dashboard/events',
    EARNINGS: '/host-dashboard/earnings',
    PAYOUTS: '/host-dashboard/payouts',
    PROMO_CODES: '/host-dashboard/promo-codes',
    BECOME_HOST: '/become-host',
  },
};
