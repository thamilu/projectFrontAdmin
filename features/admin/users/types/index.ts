/**
 * Users Feature Types
 */

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
