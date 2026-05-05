import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerRequest } from '@/types/seller-request';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/constants';
import { apiGet, apiPost, transformBackendArray } from './utils/api-fetch';

export function useSellerRequests() {
    const queryClient = useQueryClient();

    const { data: requests, isLoading, error, isError } = useQuery<SellerRequest[]>({
        queryKey: ['sellerRequests'],
        queryFn: async () => {
            const data = await apiGet(API_ENDPOINTS.SELLERS.REQUESTS);
            
            // Map backend fields to frontend type
            return transformBackendArray(data, (item: any) => ({
                id: item.id?.toString() || '',
                userId: item.userId?.toString() || '',
                email: item.email || '',
                fullName: item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : (item.firstName || item.lastName || item.displayName || 'Unknown'),
                shopName: item.shopName || item.storeName || item.businessName || 'Unnamed Shop',
                shopDescription: item.description,
                status: item.status,
                requestedAt: item.createdAt,

                // Specific fields
                phone: item.personalMobileNumber || item.businessMobileNumber || item.phone || item.phoneNumber || item.user?.phone || item.user?.phoneNumber,
                personalPhone: item.personalMobileNumber || item.user?.phone || item.user?.phoneNumber || item.phone,
                businessPhone: item.businessMobileNumber || item.storePhone || item.shopPhone || item.kyc?.phone || item.phone,
                alternatePhone: item.alternatePhone || item.user?.alternatePhone,
                preferredLanguage: item.preferredLanguage || item.user?.preferredLanguage,

                taxId: item.kyc?.gstin || item.gstin || item.gstinNumber || item.taxId,
                pan: item.kyc?.panNumber || item.pan || item.panNumber || item.documents?.find((d: any) => d.documentType === 'PAN')?.documentNumber,
                panName: item.kyc?.panName || item.panName,
                aadhaar: item.aadhaar || item.kyc?.aadhar || item.kyc?.aadhaar || item.aadhar || item.documents?.find((d: any) => d.documentType === 'AADHAAR')?.documentNumber,
                gstin: item.kyc?.gstin || item.gstin || item.gstinNumber,
                identityType: item.identityType,
                identityTypeLabel: item.identityTypeLabel,
                businessTypes: item.businessTypes,
                businessName: item.businessName,
                businessLicense: item.documents?.find((d: any) => d.documentType === 'LICENSE')?.documentUrl || item.registrationProof || item.businessLicense,

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
            })) as SellerRequest[];
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
        onError: (error: any) => {
            let errorMessage = error.message || 'Failed to process request';
            if (error.details) {
                // If there are validation details, extract the first error message
                const firstDetail = Object.values(error.details)[0];
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
