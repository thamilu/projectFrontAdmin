/**
 * Orders Feature Types
 */

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
