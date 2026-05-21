/**
 * InventoryItem Domain Entity
 * Handles calculations, stock reservations, and inventory lifecycle rules.
 * Following pure DDD patterns, this domain entity is immutable.
 */
export class InventoryItem {
  constructor(
    public readonly productId: number,
    public readonly sku: string,
    public readonly quantity: number,
    public readonly reservedQuantity: number = 0,
    public readonly location?: string
  ) {
    this.validate();
  }

  private validate() {
    if (this.productId <= 0) {
      throw new Error('Product ID must be a positive integer');
    }
    if (!this.sku || this.sku.trim() === '') {
      throw new Error('SKU is required');
    }
    if (this.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    if (this.reservedQuantity < 0) {
      throw new Error('Reserved quantity cannot be negative');
    }
    if (this.reservedQuantity > this.quantity) {
      throw new Error('Reserved quantity cannot exceed actual quantity');
    }
  }

  /**
   * The quantity available for sale (actual quantity minus reserved stock).
   */
  public get availableQuantity(): number {
    return this.quantity - this.reservedQuantity;
  }

  /**
   * Enforces low-stock alerts.
   */
  public isLowStock(threshold: number = 10): boolean {
    return this.availableQuantity <= threshold;
  }

  /**
   * Pure Business Rule: Reserve stock for a new order.
   * Returns a new immutable InventoryItem instance.
   */
  public reserveStock(amount: number): InventoryItem {
    if (amount <= 0) {
      throw new Error('Reservation amount must be greater than zero');
    }
    if (amount > this.availableQuantity) {
      throw new Error(`Insufficient stock available to reserve ${amount} units`);
    }
    return new InventoryItem(
      this.productId,
      this.sku,
      this.quantity,
      this.reservedQuantity + amount,
      this.location
    );
  }

  /**
   * Pure Business Rule: Release reserved stock (e.g., if order is cancelled).
   * Returns a new immutable InventoryItem instance.
   */
  public releaseReservedStock(amount: number): InventoryItem {
    if (amount <= 0) {
      throw new Error('Release amount must be greater than zero');
    }
    if (amount > this.reservedQuantity) {
      throw new Error(`Cannot release more than the reserved quantity of ${this.reservedQuantity}`);
    }
    return new InventoryItem(
      this.productId,
      this.sku,
      this.quantity,
      this.reservedQuantity - amount,
      this.location
    );
  }

  /**
   * Pure Business Rule: Adjust quantity (e.g., warehouse restock or physical count adjustment).
   * Returns a new immutable InventoryItem instance.
   */
  public adjustStock(amount: number): InventoryItem {
    const newQuantity = this.quantity + amount;
    if (newQuantity < 0) {
      throw new Error('Stock adjustment would result in a negative quantity');
    }
    if (this.reservedQuantity > newQuantity) {
      throw new Error('Stock adjustment would cause reserved quantity to exceed actual quantity');
    }
    return new InventoryItem(
      this.productId,
      this.sku,
      newQuantity,
      this.reservedQuantity,
      this.location
    );
  }
}
