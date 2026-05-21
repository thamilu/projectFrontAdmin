/**
 * E-Shop Admin Contracts - Data Transfer Objects (DTOs)
 *
 * Exposes bridges and formal payload shapes across domain modules.
 */

// Category and Brand entities
export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  parentCategory?: CategoryDto | null;
  parent_id?: number | null;
  children?: CategoryDto[];
  createdAt: string;
}

export interface BrandDto {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

// Category Attributes for Products
export interface CategoryAttributesDto {
  type?: string;
  brand?: string;
  size?: string;
  availableSizes?: string[];
  color?: string;
  availableColors?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Product onboarding payload definitions
export interface ProductDto {
  id?: number;
  name: string;
  description: string;
  sku: string;
  friendlyUrl: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: number;
  categoryType: string;
  subCategory?: string;
  categoryAttributes: CategoryAttributesDto;
  brandId: number;
  shopId: number;
  tags: string[];
  featured: boolean;
  status: string;
}

// Seller Onboarding & Administration types
export interface SellerRequestDto {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  shopName: string;
  shopDescription?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'ON_HOLD' | 'NEEDS_MORE_INFO' | 'ACTIVE';
  
  // Audits & Registrations
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  requestedAt: string;
  businessLicense?: string;
  taxId?: string;
  
  // Indian Fiscal Contexts
  pan?: string;
  panName?: string;
  aadhaar?: string;
  gstin?: string;
  
  identityType?: string;
  identityTypeLabel?: string;
  businessTypes?: string[];
  businessName?: string;
  phone?: string;
  personalPhone?: string;
  alternatePhone?: string;
  preferredLanguage?: string;
  businessPhone?: string;
  
  // Banking parameters
  bankAccountNumber?: string;
  bankIfscCode?: string;
  
  // Personal profiles
  gender?: string;
  dateOfBirth?: string;
  
  // Addresses
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  
  authorizedSignatory?: string;
  googleMapsUrl?: string;
  
  // Store Addresses
  storeAddressLine1?: string;
  storeAddressLine2?: string;
  storeCity?: string;
  storeDistrict?: string;
  storeState?: string;
  storePincode?: string;
  storeCountry?: string;
  
  // Agri/Farmer Contexts
  isOwnProduce?: boolean;
  farmLocation?: string;
  landArea?: string;
  cropTypes?: string[];
  
  warehouseLocation?: string;
  
  // Branding
  shopHandle?: string;
  shopLogoUrl?: string;
}

export type SellerRequestActionDto = 'approve' | 'reject';
