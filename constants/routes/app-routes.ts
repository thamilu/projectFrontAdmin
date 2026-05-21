/**
 * Application Routes Constants — Admin
 * Centralized route definitions for the admin panel
 */

export const APP_ROUTES = {

  // ─── Root ─────────────────────────────────────────────────────────────────
  HOME: '/',

  // ─── Auth (Keycloak) ──────────────────────────────────────────────────────
  AUTH: {
    LOGIN:        '/auth/login',
    SIGNOUT:      '/auth/signout',
    UNAUTHORIZED: '/unauthorized',
  },

  // ─── Admin Panel ──────────────────────────────────────────────────────────
  ADMIN: {
    ROOT:     '/admin',

    // Dashboard
    DASHBOARD: '/admin',

    // Users
    USERS:       '/admin/users',
    USER_DETAIL: (id: string | number) => `/admin/users/${id}`,

    // Products
    PRODUCTS:       '/admin/products',
    PRODUCT_DETAIL: (id: string | number) => `/admin/products/${id}`,

    // Categories
    CATEGORIES:      '/admin/categories',
    CATEGORY_DETAIL: (id: string | number) => `/admin/categories/${id}`,

    // Shops
    SHOPS:      '/admin/shops',
    SHOP_DETAIL: (id: string | number) => `/admin/shops/${id}`,

    // Orders
    ORDERS:       '/admin/orders',
    ORDER_DETAIL: (id: string | number) => `/admin/orders/${id}`,

    // Payments
    PAYMENTS:        '/admin/payments',
    PAYMENT_DETAIL:  (id: string | number) => `/admin/payments/${id}`,

    // Inventory
    INVENTORY: '/admin/inventory',

    // Analytics
    ANALYTICS: '/admin/analytics',

    // Reports
    REPORTS: '/admin/reports',

    // Seller Requests
    SELLER_REQUESTS: '/admin/seller-requests',

    // Settings
    SETTINGS: '/admin/settings',

    // Import
    IMPORT: '/admin/import',
  },

  // ─── Error Pages ──────────────────────────────────────────────────────────
  NOT_FOUND:    '/404',
  ACCESS_DENIED: '/403',
  SERVER_ERROR:  '/500',

} as const;

export type AppRoutes = typeof APP_ROUTES;
