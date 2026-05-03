/**
 * Admin Feature Types
 * Type definitions for admin-specific functionality
 */

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Generic Paginated Response
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Admin Dashboard Statistics
export interface AdminDashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeListings: number;
  recentSignups: number;
}

// User Management Types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  active: boolean;
  createdAt: string;
  shop?: {
    id: number;
    shopName: string;
    sellerType: string;
  };
}

export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER' | 'DELIVERY_AGENT';

export interface UserFilters {
  role?: string;
  search?: string;
  page?: number;
  size?: number;
}

// Category Management Types
export interface AdminCategory {
  id: number;
  name: string;
  slug?: string;
}

export interface CategoryRequest {
  id: number;
  categoryName: string;
  sellerName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CategoryReviewRequest {
  approved: boolean;
  remarks: string;
}

// Store/Shop Management Types
export interface AdminShop {
  id: number;
  shopName: string;
  sellerName: string;
  sellerType: 'FARMER' | 'RETAIL_SELLER' | 'WHOLESALER';
  phoneNumber: string;
  address?: string;
  active: boolean;
  createdAt: string;
}

export interface ShopFilters {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}

// Order Management Types
export interface AdminOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
    };
  }>;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderFilters {
  status?: OrderStatus | string;
  search?: string;
  page?: number;
  size?: number;
}

// Product Management Types
export interface AdminProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  categoryName: string;
  categoryPath: string;
  status: ProductStatus;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'OUT_OF_STOCK' | 'ARCHIVED';

export interface ProductInventory {
  id: number;
  name: string;
  sku: string;
  stockQuantity: number;
  price: number;
  categoryName: string;
  lowStockThreshold: number;
}

export interface StockUpdateRequest {
  operation: 'SET' | 'INCREMENT' | 'DECREMENT';
  quantity: number;
}

export interface ProductFilters {
  keyword?: string;
  productName?: string;
  categoryId?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  lowStockOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

// Analytics Types
export interface AdminAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  revenue: AnalyticsDataPoint[];
  orders: AnalyticsDataPoint[];
  users: AnalyticsDataPoint[];
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
}
