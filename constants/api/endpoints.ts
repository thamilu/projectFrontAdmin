/**
 * API Constants — Admin
 * Centralized API endpoints matching Spring Boot backend
 *
 * IMPORTANT: Axios baseURL is configured in env.ts (NEXT_PUBLIC_API_BASE_URL)
 *            All endpoints must include full path starting with /api/
 *
 * Request Flow:
 *   Frontend calls: /api/v1/users
 *   Axios baseURL:  http://localhost:8082
 *   Final URL:      http://localhost:8082/api/v1/users
 */

export const API_ENDPOINTS = {

  // ─── Auth (/api/auth) ─────────────────────────────────────────────────────
  AUTH: {
    LOGIN:           '/api/auth/login',
    REGISTER:        '/api/auth/register',
    LOGOUT:          '/api/auth/logout',
    REFRESH:         '/api/auth/refresh',
    ME:              '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD:  '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
    VERIFY_EMAIL:    '/api/auth/verify-email',
  },

  // ─── Dashboard (/api/v1/dashboard) ────────────────────────────────────────
  DASHBOARD: {
    ADMIN:          '/api/v1/dashboard/admin',
    SELLER:         '/api/v1/dashboard/seller',
    CUSTOMER:       '/api/v1/dashboard/customer',
    DELIVERY_AGENT: '/api/v1/dashboard/delivery-agent',
  },

  // ─── Users (/api/v1/users) ────────────────────────────────────────────────
  USERS: {
    LIST:       '/api/v1/users',
    DETAIL:     (id: number | string) => `/api/v1/users/${id}`,
    UPDATE:     (id: number | string) => `/api/v1/users/${id}`,
    DELETE:     (id: number | string) => `/api/v1/users/${id}`,
    BY_ROLE:    (role: string) => `/api/v1/users/role/${role}`,
    ACTIVATE:   (id: number | string) => `/api/v1/users/${id}/activate`,
    DEACTIVATE: (id: number | string) => `/api/v1/users/${id}/deactivate`,
    SET_ROLE:   (id: number | string) => `/api/v1/users/${id}/role`,
  },

  // ─── Products (/api/v1/products) ──────────────────────────────────────────
  PRODUCTS: {
    LIST:        '/api/v1/products',
    DETAIL:      (id: number | string) => `/api/v1/products/${id}`,
    CREATE:      '/api/v1/products',
    UPDATE:      (id: number | string) => `/api/v1/products/${id}`,
    DELETE:      (id: number | string) => `/api/v1/products/${id}`,
    SEARCH:      '/api/v1/products/search',
    FEATURED:    '/api/v1/products/featured',
    BY_CATEGORY: (categoryId: number | string) => `/api/v1/products/category/${categoryId}`,
    BY_SHOP:     (shopId: number | string) => `/api/v1/products/shop/${shopId}`,
    UPDATE_STOCK:  (id: number | string) => `/api/v1/products/${id}/stock`,
    UPDATE_STATUS: (id: number | string) => `/api/v1/products/${id}/status`,
    TOGGLE_FEATURED: (id: number | string) => `/api/v1/products/${id}/featured`,
  },

  // ─── Categories (/api/v1/categories) ─────────────────────────────────────
  CATEGORIES: {
    LIST:   '/api/v1/categories',
    TREE:   '/api/v1/categories/tree',
    DETAIL: (id: number | string) => `/api/v1/categories/${id}`,
    CREATE: '/api/v1/categories',
    UPDATE: (id: number | string) => `/api/v1/categories/${id}`,
    DELETE: (id: number | string) => `/api/v1/categories/${id}`,
    // Admin-specific category requests
    ADMIN_CREATE:           '/api/v1/admin/categories',
    PENDING_REQUESTS:       '/api/v1/admin/categories/requests/pending',
    REVIEW_REQUEST:         (requestId: number | string) => `/api/v1/admin/categories/requests/${requestId}/review`,
  },

  // ─── Shops / Stores (/api/v1/stores) ──────────────────────────────────────
  SHOPS: {
    LIST:   '/api/v1/stores',
    SEARCH: '/api/v1/stores/search',
    DETAIL: (id: number | string) => `/api/v1/stores/${id}`,
    CREATE: '/api/v1/stores',
    UPDATE: (id: number | string) => `/api/v1/stores/${id}`,
    DELETE: (id: number | string) => `/api/v1/stores/${id}`,
  },

  // ─── Orders (/api/v1/orders) ──────────────────────────────────────────────
  ORDERS: {
    LIST:                 '/api/v1/orders',
    CREATE:               '/api/v1/orders',
    DETAIL:               (id: number | string) => `/api/v1/orders/${id}`,
    BY_NUMBER:            (orderNumber: string) => `/api/v1/orders/number/${orderNumber}`,
    BY_STATUS:            (status: string) => `/api/v1/orders/status/${status}`,
    BY_SHOP:              (shopId: number | string) => `/api/v1/orders/shop/${shopId}`,
    UPDATE_STATUS:        (id: number | string) => `/api/v1/orders/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id: number | string) => `/api/v1/orders/${id}/payment-status`,
    CANCEL:               (id: number | string) => `/api/v1/orders/${id}/cancel`,
    MY_ORDERS:            '/api/v1/orders/my-orders',
  },

  // ─── Payments (/api/v1/payments) ──────────────────────────────────────────
  PAYMENTS: {
    CREATE_INTENT: '/api/v1/payments/create-intent',
    CONFIRM:       '/api/v1/payments/confirm',
    REFUND:        (id: number | string) => `/api/v1/payments/${id}/refund`,
    ANALYTICS:     '/api/v1/payments/analytics',
  },

  // ─── Analytics (/api/v1/analytics) ────────────────────────────────────────
  ANALYTICS: {
    PAYMENT:   (period: string) => `/api/v1/analytics/payment?period=${period}`,
    PRODUCTS:  '/api/v1/analytics/products',
    ORDERS:    '/api/v1/analytics/orders',
    CUSTOMERS: '/api/v1/analytics/customers',
  },

  // ─── Sellers (/api/v1/sellers) ────────────────────────────────────────────
  SELLERS: {
    REGISTER:       '/api/v1/sellers/register',
    PROFILE:        '/api/v1/sellers/profile',
    PROFILE_EXISTS: '/api/v1/sellers/profile/exists',
    REQUESTS:       '/api/v1/sellers/requests',
    APPROVE:        (id: number | string) => `/api/v1/sellers/requests/${id}/approve`,
    REJECT:         (id: number | string) => `/api/v1/sellers/requests/${id}/reject`,
  },

  // ─── Inventory (/api/v1/inventory) ────────────────────────────────────────
  INVENTORY: {
    LOW_STOCK:    '/api/v1/inventory/low-stock',
    UPDATE_STOCK: (productId: number | string) => `/api/v1/inventory/${productId}/stock`,
  },

  // ─── Reports (/api/v1/admin/reports) ──────────────────────────────────────
  REPORTS: {
    SALES:     '/api/v1/admin/reports/sales',
    INVENTORY: '/api/v1/admin/reports/inventory',
    CUSTOMERS: '/api/v1/admin/reports/customers',
  },

  // ─── Reviews (/api/v1/productReviews) ────────────────────────────────────
  REVIEWS: {
    BY_PRODUCT: (productId: number | string) => `/api/v1/products/${productId}/reviews`,
    UPDATE:     (id: number | string) => `/api/v1/productReviews/${id}`,
    DELETE:     (id: number | string) => `/api/v1/productReviews/${id}`,
  },

} as const;

// ─── HTTP Config ─────────────────────────────────────────────────────────────
export const API_CONFIG = {
  TIMEOUT:        30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY:    1000,
} as const;

// ─── HTTP Status Codes ────────────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK:                    200,
  CREATED:               201,
  NO_CONTENT:            204,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  UNPROCESSABLE_ENTITY:  422,
  TOO_MANY_REQUESTS:     429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE:   503,
} as const;
