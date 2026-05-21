/**
 * E-Shop Admin Contracts - Event Signatures
 *
 * Defines strictly typed structures for cross-context events,
 * pub/sub architectures, or local event broker messaging.
 */

export interface BaseEvent {
  eventId: string;
  timestamp: string;
  version: string;
  source: string;
}

// Authentication transitions
export interface UserAuthEvent extends BaseEvent {
  type: 'AUTH.LOGIN' | 'AUTH.LOGOUT' | 'AUTH.REFRESH_FAILED';
  payload: {
    userId: string;
    email: string;
    roles: string[];
    provider: 'keycloak' | 'credentials';
    clientIp?: string;
  };
}

// Onboarding and application reviews
export interface SellerApprovalEvent extends BaseEvent {
  type: 'SELLER.SUBMITTED' | 'SELLER.APPROVED' | 'SELLER.REJECTED' | 'SELLER.SUSPENDED';
  payload: {
    requestId: string;
    sellerId: string;
    email: string;
    shopName: string;
    actorUserId: string; // The admin reviewer id
    reason?: string;
  };
}

// Product stock, publication, and pricing changes
export interface ProductLifecycleEvent extends BaseEvent {
  type: 'PRODUCT.CREATED' | 'PRODUCT.UPDATED' | 'PRODUCT.DELETED' | 'PRODUCT.STOCK_OUT' | 'PRODUCT.PRICE_CHANGED';
  payload: {
    productId: number;
    sku: string;
    price: number;
    stockQuantity: number;
    shopId: number;
    actorUserId: string;
  };
}

export type EShopSystemEvent = UserAuthEvent | SellerApprovalEvent | ProductLifecycleEvent;
