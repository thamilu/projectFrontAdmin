/**
 * Products Feature Types
 */

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

export interface StockUpdateRequest {
  operation: 'SET' | 'INCREMENT' | 'DECREMENT';
  quantity: number;
}

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
