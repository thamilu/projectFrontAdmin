/**
 * Pricing Policy interface for product valuation and compliance.
 */
export interface PricingPolicy {
  validatePricing(price: number, costPrice?: number): { isValid: boolean; reason?: string };
  calculateSuggestedRetailPrice(costPrice: number): number;
  isDiscountAllowed(regularPrice: number, discountPrice: number): boolean;
}

/**
 * Enterprise Retail Pricing Policy
 * Enforces corporate margins and MAP (Minimum Advertised Price) rules.
 */
export class RetailPricingPolicy implements PricingPolicy {
  constructor(
    private readonly minMarginRate: number = 0.15, // Minimum 15% profit margin over cost price
    private readonly maxDiscountPercentage: number = 0.50 // Maximum 50% discount off regular price
  ) {}

  /**
   * Validates if the selling price is acceptable according to the cost price margin requirements.
   */
  public validatePricing(price: number, costPrice?: number): { isValid: boolean; reason?: string } {
    if (price < 0) {
      return { isValid: false, reason: 'Selling price cannot be negative' };
    }

    if (costPrice !== undefined) {
      if (costPrice < 0) {
        return { isValid: false, reason: 'Cost price cannot be negative' };
      }
      
      const minimumAllowedPrice = costPrice * (1 + this.minMarginRate);
      if (price < minimumAllowedPrice) {
        return {
          isValid: false,
          reason: `Selling price violates minimum profit margin of ${this.minMarginRate * 100}%. Minimum allowed: ${minimumAllowedPrice.toFixed(2)}`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Calculates suggested retail price using a default margin.
   */
  public calculateSuggestedRetailPrice(costPrice: number): number {
    if (costPrice < 0) {
      throw new Error('Cost price cannot be negative');
    }
    // SRP represents a standard 30% margin over cost price
    return costPrice * 1.30;
  }

  /**
   * Enforces MAP rules: discountPrice cannot be less than 50% of the regular price.
   */
  public isDiscountAllowed(regularPrice: number, discountPrice: number): boolean {
    if (regularPrice <= 0 || discountPrice <= 0) {
      return false;
    }
    if (discountPrice >= regularPrice) {
      return false; // Discount price must be less than regular price
    }
    const maxDiscountAllowed = regularPrice * (1 - this.maxDiscountPercentage);
    return discountPrice >= maxDiscountAllowed;
  }
}
