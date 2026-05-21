/**
 * Product Domain Entity
 * Enforces pure business constraints and validation.
 */
export class Product {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly sku: string,
    public readonly price: number,
    public readonly stockQuantity: number,
    public readonly lowStockThreshold: number = 10,
    public readonly active: boolean = true
  ) {
    this.validate();
  }

  /**
   * Pure domain rule: validates that the product conforms to corporate guidelines.
   */
  private validate() {
    if (!this.name || this.name.trim().length < 3) {
      throw new Error('Product name must be at least 3 characters long');
    }
    if (this.price < 0) {
      throw new Error('Product price cannot be negative');
    }
    if (this.stockQuantity < 0) {
      throw new Error('Product stock quantity cannot be negative');
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(this.sku)) {
      throw new Error('Product SKU must be alphanumeric');
    }
  }

  /**
   * Business rule: Checks if the current stock is below low stock threshold.
   */
  public get isLowStock(): boolean {
    return this.stockQuantity <= this.lowStockThreshold;
  }

  /**
   * Business rule: Checks if product is active and has stock.
   */
  public get isPurchasable(): boolean {
    return this.active && this.stockQuantity > 0;
  }
}
