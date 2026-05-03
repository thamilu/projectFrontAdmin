export interface SellerRequest {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  shopName: string;
  shopDescription?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'ON_HOLD' | 'NEEDS_MORE_INFO' | 'ACTIVE';

  // Audit
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  requestedAt: string;
  businessLicense?: string;
  taxId?: string; // Generic Tax ID

  // New specific fields
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

  // Bank Details
  bankAccountNumber?: string;
  bankIfscCode?: string;

  // Personal Info
  gender?: string;
  dateOfBirth?: string;

  // Personal Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;

  // Additional Business Info
  authorizedSignatory?: string;
  googleMapsUrl?: string;

  // Store Address
  storeAddressLine1?: string;
  storeAddressLine2?: string;
  storeCity?: string;
  storeDistrict?: string;
  storeState?: string;
  storePincode?: string;
  storeCountry?: string;
  // Farmer Details
  isOwnProduce?: boolean;
  farmLocation?: string;
  landArea?: string;
  cropTypes?: string[];

  // Warehouse Info
  warehouseLocation?: string;

  // Global Contextual Identity
  shopHandle?: string;
  shopLogoUrl?: string;
}

export type SellerRequestAction = 'approve' | 'reject';
