/**
 * API Constants — Admin
 * Centralized API endpoints matching Spring Boot backend
 *
 * Paths are relative to axios `clientApiBaseUrl` (default `/api`).
 * Use `clientApiUrl()` from `@/constants/api/client-url` for raw `fetch()`.
 *
 * Request flow (browser):
 *   API_ENDPOINTS.DASHBOARD.ADMIN → `/v1/dashboard/admin`
 *   axios baseURL → `/api`
 *   final URL → `http://localhost:3001/api/v1/dashboard/admin`
 */

export const API_ENDPOINTS = {

  // ─── Auth ─────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN:           '/auth/login',
    REGISTER:        '/auth/register',
    LOGOUT:          '/auth/logout',
    REFRESH:         '/auth/refresh',
    ME:              '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD:  '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL:    '/auth/verify-email',
  },

  // ─── Dashboard (/v1/dashboard) ────────────────────────────────────────────
  DASHBOARD: {
    ADMIN:          '/v1/dashboard/admin',
    SELLER:         '/v1/dashboard/seller',
    CUSTOMER:       '/v1/dashboard/customer',
    DELIVERY_AGENT: '/v1/dashboard/delivery-agent',
  },

  // ─── Users (/v1/users) ────────────────────────────────────────────────────
  USERS: {
    LIST:       '/v1/users',
    DETAIL:     (id: number | string) => `/v1/users/${id}`,
    UPDATE:     (id: number | string) => `/v1/users/${id}`,
    DELETE:     (id: number | string) => `/v1/users/${id}`,
    BY_ROLE:    (role: string) => `/v1/users/role/${role}`,
    ACTIVATE:   (id: number | string) => `/v1/users/${id}/activate`,
    DEACTIVATE: (id: number | string) => `/v1/users/${id}/deactivate`,
    SET_ROLE:   (id: number | string) => `/v1/users/${id}/role`,
  },

  // ─── Products (/v1/products) ──────────────────────────────────────────────
  PRODUCTS: {
    LIST:        '/v1/products',
    DETAIL:      (id: number | string) => `/v1/products/${id}`,
    CREATE:      '/v1/products',
    UPDATE:      (id: number | string) => `/v1/products/${id}`,
    DELETE:      (id: number | string) => `/v1/products/${id}`,
    SEARCH:      '/v1/products/search',
    FEATURED:    '/v1/products/featured',
    BY_CATEGORY: (categoryId: number | string) => `/v1/products/category/${categoryId}`,
    BY_SHOP:     (shopId: number | string) => `/v1/products/shop/${shopId}`,
    UPDATE_STOCK:  (id: number | string) => `/v1/products/${id}/stock`,
    UPDATE_STATUS: (id: number | string) => `/v1/products/${id}/status`,
    TOGGLE_FEATURED: (id: number | string) => `/v1/products/${id}/featured`,
  },

  // ─── Categories (/v1/categories) ─────────────────────────────────────────
  CATEGORIES: {
    LIST:   '/v1/categories',
    TREE:   '/v1/categories/tree',
    DETAIL: (id: number | string) => `/v1/categories/${id}`,
    CREATE: '/v1/categories',
    UPDATE: (id: number | string) => `/v1/categories/${id}`,
    DELETE: (id: number | string) => `/v1/categories/${id}`,
    ADMIN_CREATE:           '/v1/admin/categories',
    PENDING_REQUESTS:       '/v1/admin/categories/requests/pending',
    REVIEW_REQUEST:         (requestId: number | string) => `/v1/admin/categories/requests/${requestId}/review`,
  },

  // ─── Shops / Stores (/v1/stores) ────────────────────────────────────────
  SHOPS: {
    LIST:   '/v1/stores',
    SEARCH: '/v1/stores/search',
    DETAIL: (id: number | string) => `/v1/stores/${id}`,
    CREATE: '/v1/stores',
    UPDATE: (id: number | string) => `/v1/stores/${id}`,
    DELETE: (id: number | string) => `/v1/stores/${id}`,
  },

  // ─── Orders (/v1/orders) ──────────────────────────────────────────────────
  ORDERS: {
    LIST:                 '/v1/orders',
    CREATE:               '/v1/orders',
    DETAIL:               (id: number | string) => `/v1/orders/${id}`,
    BY_NUMBER:            (orderNumber: string) => `/v1/orders/number/${orderNumber}`,
    BY_STATUS:            (status: string) => `/v1/orders/status/${status}`,
    BY_SHOP:              (shopId: number | string) => `/v1/orders/shop/${shopId}`,
    UPDATE_STATUS:        (id: number | string) => `/v1/orders/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id: number | string) => `/v1/orders/${id}/payment-status`,
    CANCEL:               (id: number | string) => `/v1/orders/${id}/cancel`,
    MY_ORDERS:            '/v1/orders/my-orders',
  },

  // ─── Payments (/v1/payments) ──────────────────────────────────────────────
  PAYMENTS: {
    CREATE_INTENT: '/v1/payments/create-intent',
    CONFIRM:       '/v1/payments/confirm',
    REFUND:        (id: number | string) => `/v1/payments/${id}/refund`,
    ANALYTICS:     '/v1/payments/analytics',
  },

  // ─── Analytics (/v1/analytics) ──────────────────────────────────────────
  ANALYTICS: {
    PAYMENT:   (period: string) => `/v1/analytics/payment?period=${period}`,
    PRODUCTS:  '/v1/analytics/products',
    ORDERS:    '/v1/analytics/orders',
    CUSTOMERS: '/v1/analytics/customers',
  },

  // ─── Sellers (/v1/sellers) ────────────────────────────────────────────────
  SELLERS: {
    REGISTER:       '/v1/sellers/register',
    PROFILE:        '/v1/sellers/profile',
    PROFILE_EXISTS: '/v1/sellers/profile/exists',
    REQUESTS:       '/v1/sellers/requests',
    APPROVE:        (id: number | string) => `/v1/sellers/requests/${id}/approve`,
    REJECT:         (id: number | string) => `/v1/sellers/requests/${id}/reject`,
  },

  // ─── Inventory (/v1/inventory) ────────────────────────────────────────────
  INVENTORY: {
    LOW_STOCK:    '/v1/inventory/low-stock',
    UPDATE_STOCK: (productId: number | string) => `/v1/inventory/${productId}/stock`,
  },

  // ─── Reports (/v1/admin/reports) ─────────────────────────────────────────
  REPORTS: {
    SALES:     '/v1/admin/reports/sales',
    INVENTORY: '/v1/admin/reports/inventory',
    CUSTOMERS: '/v1/admin/reports/customers',
  },

  // ─── Reviews (/v1/productReviews) ─────────────────────────────────────────
  REVIEWS: {
    BY_PRODUCT: (productId: number | string) => `/v1/products/${productId}/reviews`,
    UPDATE:     (id: number | string) => `/v1/productReviews/${id}`,
    DELETE:     (id: number | string) => `/v1/productReviews/${id}`,
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
