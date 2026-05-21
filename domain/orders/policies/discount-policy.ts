import { Order } from '../entities/order';

export interface DiscountPolicy {
  calculateDiscount(order: Order, customerRole?: string): number;
}

/**
 * Enterprise Bulk Purchase Discount Policy
 * Gives a discount if the total quantity of items in an order exceeds a certain threshold.
 */
export class BulkPurchaseDiscountPolicy implements DiscountPolicy {
  constructor(
    private readonly minQuantity: number = 10,
    private readonly discountRate: number = 0.05 // 5% bulk discount
  ) {}

  public calculateDiscount(order: Order): number {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity >= this.minQuantity) {
      return order.subtotal * this.discountRate;
    }
    return 0;
  }
}

/**
 * Enterprise VIP Customer Discount Policy
 * Gives a 10% discount on order subtotal for VIP customers.
 */
export class VipDiscountPolicy implements DiscountPolicy {
  constructor(private readonly vipDiscountRate: number = 0.10) {}

  public calculateDiscount(order: Order, customerRole?: string): number {
    if (customerRole?.toUpperCase() === 'VIP' || customerRole?.toUpperCase() === 'ADMIN') {
      return order.subtotal * this.vipDiscountRate;
    }
    return 0;
  }
}

/**
 * Enterprise Composite Discount Policy
 * Combines multiple discount policies and enforces a maximum discount limit (cap).
 */
export class CompositeDiscountPolicy implements DiscountPolicy {
  constructor(
    private readonly policies: DiscountPolicy[],
    private readonly maxDiscountPercentage: number = 0.50 // Max 50% discount cap
  ) {}

  public calculateDiscount(order: Order, customerRole?: string): number {
    const subtotal = order.subtotal;
    if (subtotal <= 0) return 0;

    // Sum discounts from all policies
    const rawDiscount = this.policies.reduce(
      (total, policy) => total + policy.calculateDiscount(order, customerRole),
      0
    );

    // Enforce the maximum discount cap
    const maxDiscount = subtotal * this.maxDiscountPercentage;
    return Math.min(rawDiscount, maxDiscount);
  }
}
