import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerRequest } from '@/types';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/constants';
import { apiGet, apiPost, transformBackendArray } from '@/shared/utils/api-fetch';

export interface BackendSellerRequest {
  id?: string | number;
  userId?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  shopName?: string;
  storeName?: string;
  businessName?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  personalMobileNumber?: string;
  businessMobileNumber?: string;
  phone?: string;
  phoneNumber?: string;
  user?: {
    phone?: string;
    phoneNumber?: string;
    alternatePhone?: string;
    preferredLanguage?: string;
  };
  storePhone?: string;
  shopPhone?: string;
  kyc?: {
    gstin?: string;
    panNumber?: string;
    panName?: string;
    aadhar?: string;
    aadhaar?: string;
    phone?: string;
  };
  alternatePhone?: string;
  preferredLanguage?: string;
  gstin?: string;
  gstinNumber?: string;
  taxId?: string;
  pan?: string;
  panNumber?: string;
  documents?: Array<{
    documentType: string;
    documentNumber?: string;
    documentUrl?: string;
  }>;
  panName?: string;
  aadhaar?: string;
  aadhar?: string;
  identityType?: string;
  identityTypeLabel?: string;
  businessTypes?: string[];
  registrationProof?: string;
  businessLicense?: string;
  bankAccounts?: Array<{
    accountNumber?: string;
    ifscCode?: string;
  }>;
  accountNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankIfscCode?: string;
  gender?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  businessDetails?: {
    authorizedSignatory?: string;
    warehouseLocation?: string;
  };
  authorizedSignatory?: string;
  googleMapsUrl?: string;
  storeAddressLine1?: string;
  storeAddressLine2?: string;
  storeCity?: string;
  storeDistrict?: string;
  storeState?: string;
  storePincode?: string;
  storeCountry?: string;
  farmerDetails?: {
    isOwnProduce?: boolean;
    farmLocation?: string;
    landArea?: string;
    cropTypes?: string[];
  };
}

export function useSellerRequests() {
    const queryClient = useQueryClient();

    const { data: requests, isLoading, error, isError } = useQuery<SellerRequest[]>({
        queryKey: ['sellerRequests'],
        queryFn: async () => {
            const data = await apiGet(API_ENDPOINTS.SELLERS.REQUESTS);
            
            // Map backend fields to frontend type
            return transformBackendArray<BackendSellerRequest, SellerRequest>(data, (item) => ({
                id: item.id?.toString() || '',
                userId: item.userId?.toString() || '',
                email: item.email || '',
                fullName: item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : (item.firstName || item.lastName || item.displayName || 'Unknown'),
                shopName: item.shopName || item.storeName || item.businessName || 'Unnamed Shop',
                shopDescription: item.description,
                status: (item.status || 'PENDING') as SellerRequest['status'],
                requestedAt: item.createdAt || '',

                // Specific fields
                phone: item.personalMobileNumber || item.businessMobileNumber || item.phone || item.phoneNumber || item.user?.phone || item.user?.phoneNumber,
                personalPhone: item.personalMobileNumber || item.user?.phone || item.user?.phoneNumber || item.phone,
                businessPhone: item.businessMobileNumber || item.storePhone || item.shopPhone || item.kyc?.phone || item.phone,
                alternatePhone: item.alternatePhone || item.user?.alternatePhone,
                preferredLanguage: item.preferredLanguage || item.user?.preferredLanguage,

                taxId: item.kyc?.gstin || item.gstin || item.gstinNumber || item.taxId,
                pan: item.kyc?.panNumber || item.pan || item.panNumber || item.documents?.find((d) => d.documentType === 'PAN')?.documentNumber,
                panName: item.kyc?.panName || item.panName,
                aadhaar: item.aadhaar || item.kyc?.aadhar || item.kyc?.aadhaar || item.aadhar || item.documents?.find((d) => d.documentType === 'AADHAAR')?.documentNumber,
                gstin: item.kyc?.gstin || item.gstin || item.gstinNumber,
                identityType: item.identityType,
                identityTypeLabel: item.identityTypeLabel,
                businessTypes: item.businessTypes,
                businessName: item.businessName,
                businessLicense: item.documents?.find((d) => d.documentType === 'LICENSE')?.documentUrl || item.registrationProof || item.businessLicense,

                // Bank Details
                bankAccountNumber: item.bankAccounts?.[0]?.accountNumber || item.accountNumber || item.bankAccountNumber,
                bankIfscCode: item.bankAccounts?.[0]?.ifscCode || item.ifscCode || item.bankIfscCode,

                // Personal Info
                gender: item.gender,
                dateOfBirth: item.dateOfBirth,

                // Personal Address
                addressLine1: item.addressLine1,
                addressLine2: item.addressLine2,
                city: item.city,
                district: item.district,
                state: item.state,
                pincode: item.pincode,
                country: item.country,

                // Additional Business Info
                authorizedSignatory: item.businessDetails?.authorizedSignatory || item.authorizedSignatory,
                googleMapsUrl: item.googleMapsUrl,

                // Store Address
                storeAddressLine1: item.storeAddressLine1,
                storeAddressLine2: item.storeAddressLine2,
                storeCity: item.storeCity,
                storeDistrict: item.storeDistrict,
                storeState: item.storeState,
                storePincode: item.storePincode,
                storeCountry: item.storeCountry,

                // Farmer Details
                isOwnProduce: item.farmerDetails?.isOwnProduce,
                farmLocation: item.farmerDetails?.farmLocation,
                landArea: item.farmerDetails?.landArea,
                cropTypes: item.farmerDetails?.cropTypes,

                // Warehouse Info
                warehouseLocation: item.businessDetails?.warehouseLocation,
            }));
        },
    });

    const actionMutation = useMutation({
        mutationFn: async ({
            id,
            action,
            reason,
        }: {
            id: string;
            action: 'approve' | 'reject';
            reason?: string;
        }) => {
            const body = reason ? { reason } : undefined;
            const endpoint = action === 'approve' 
              ? API_ENDPOINTS.SELLERS.APPROVE(id) 
              : API_ENDPOINTS.SELLERS.REJECT(id);
            await apiPost(endpoint, body);
            return { id, action };
        },
        onSuccess: (_, { action }) => {
            toast.success(`Seller request ${action}ed successfully`);
            queryClient.invalidateQueries({ queryKey: ['sellerRequests'] });
        },
        onError: (error: unknown) => {
            const apiError = error as { message?: string; details?: Record<string, unknown> };
            let errorMessage = apiError.message || 'Failed to process request';
            if (apiError.details) {
                // If there are validation details, extract the first error message
                const firstDetail = Object.values(apiError.details)[0];
                if (Array.isArray(firstDetail) && firstDetail.length > 0) {
                    errorMessage = `${errorMessage}: ${firstDetail[0]}`;
                }
            }
            toast.error(errorMessage);
        },
    });

    return {
        requests,
        isLoading,
        approveRequest: (id: string) => actionMutation.mutate({ id, action: 'approve' }),
        rejectRequest: (id: string, reason: string) => actionMutation.mutate({ id, action: 'reject', reason }),
        isProcessing: actionMutation.isPending,
        error,
        isError
    };
}
