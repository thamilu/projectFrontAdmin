/**
 * Business Constants — Admin
 * E-commerce admin domain-specific constants
 */

// ─── Order ────────────────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING:    'PENDING',
  CONFIRMED:  'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED:    'SHIPPED',
  DELIVERED:  'DELIVERED',
  CANCELLED:  'CANCELLED',
  REFUNDED:   'REFUNDED',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ─── Payment ──────────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING:    'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED:  'COMPLETED',
  FAILED:     'FAILED',
  REFUNDED:   'REFUNDED',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// ─── Product ──────────────────────────────────────────────────────────────────
export const PRODUCT_STATUS = {
  ACTIVE:        'ACTIVE',
  INACTIVE:      'INACTIVE',
  OUT_OF_STOCK:  'OUT_OF_STOCK',
  DISCONTINUED:  'DISCONTINUED',
} as const;

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

// ─── User Roles ───────────────────────────────────────────────────────────────
export const USER_ROLES = {
  ADMIN:          'ADMIN',
  SELLER:         'SELLER',
  CUSTOMER:       'CUSTOMER',
  DELIVERY_AGENT: 'DELIVERY_AGENT',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ─── Shop / Store ─────────────────────────────────────────────────────────────
export const SHOP_STATUS = {
  ACTIVE:         'ACTIVE',
  SUSPENDED:      'SUSPENDED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  CLOSED:         'CLOSED',
} as const;

export type ShopStatus = typeof SHOP_STATUS[keyof typeof SHOP_STATUS];

// ─── Seller Request ───────────────────────────────────────────────────────────
export const SELLER_REQUEST_STATUS = {
  PENDING:  'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type SellerRequestStatus = typeof SELLER_REQUEST_STATUS[keyof typeof SELLER_REQUEST_STATUS];

// ─── Category Request ─────────────────────────────────────────────────────────
export const CATEGORY_REQUEST_STATUS = {
  PENDING:  'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE:      1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE:     100,
  PAGE_SIZES:        [10, 20, 50, 100],
} as const;

// ─── Inventory ────────────────────────────────────────────────────────────────
export const INVENTORY = {
  LOW_STOCK_THRESHOLD: 10,
  OUT_OF_STOCK:        0,
} as const;

// ─── Analytics Periods ────────────────────────────────────────────────────────
export const ANALYTICS_PERIODS = {
  DAY:   'day',
  WEEK:  'week',
  MONTH: 'month',
  YEAR:  'year',
} as const;

export type AnalyticsPeriod = typeof ANALYTICS_PERIODS[keyof typeof ANALYTICS_PERIODS];

// ─── File Upload ──────────────────────────────────────────────────────────────
export const FILE_UPLOAD = {
  MAX_FILE_SIZE:         5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES:   ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_IMAGES_PER_PRODUCT: 5,
} as const;

// ─── Validation ───────────────────────────────────────────────────────────────
export const VALIDATION = {
  MIN_PASSWORD_LENGTH:     8,
  MAX_PASSWORD_LENGTH:     128,
  MIN_PRODUCT_PRICE:       0.01,
  MAX_PRODUCT_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH:  5000,
} as const;

// ─── Price / Currency ─────────────────────────────────────────────────────────
export const PRICE = {
  MIN:             0,
  MAX:             1000000,
  CURRENCY:        'INR',
  CURRENCY_SYMBOL: '₹',
} as const;
