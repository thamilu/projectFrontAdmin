/**
 * Order Domain Entity
 * Handles calculations and order lifecycle validation.
 */
export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export class Order {
  public static TAX_RATE = 0.18; // Standard 18% GST

  constructor(
    public readonly id: number,
    public readonly orderNumber: string,
    public readonly items: OrderItem[],
    public readonly status: string,
    public readonly discountAmount: number = 0
  ) {
    this.validate();
  }

  private validate() {
    if (!this.orderNumber) {
      throw new Error('Order number is required');
    }
    if (this.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    this.items.forEach(item => {
      if (item.price < 0) throw new Error('Item price cannot be negative');
      if (item.quantity <= 0) throw new Error('Item quantity must be greater than zero');
    });
  }

  /**
   * Calculates subtotal of all items.
   */
  public get subtotal(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /**
   * Calculates standard tax amount on subtotal.
   */
  public get taxAmount(): number {
    return (this.subtotal - this.discountAmount) * Order.TAX_RATE;
  }

  /**
   * Calculates final grand total.
   */
  public get grandTotal(): number {
    const total = this.subtotal - this.discountAmount + this.taxAmount;
    return Math.max(0, total);
  }
}
