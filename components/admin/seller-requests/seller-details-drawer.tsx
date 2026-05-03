'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SellerRequest } from '@/types/seller-request';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  FileText, 
  Building, 
  User, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Smartphone,
  Languages,
  ExternalLink,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SellerDetailsDrawerProps {
  request: SellerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
}

export function SellerDetailsDrawer({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isProcessing,
}: SellerDetailsDrawerProps) {
  if (!request) return null;

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const IDENTITY_LABELS: Record<string, string> = {
    INDIVIDUAL: 'Individual Seller',
    BUSINESS: 'Registered Business',
    FARMER: 'Farmer / Producer',
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l shadow-2xl">
          {/* Custom Header Area */}
          <div className="bg-muted/30 px-6 py-8 border-b">
            <SheetHeader className="text-left">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline" className={`font-bold tracking-tight px-3 py-1 rounded-full ${STATUS_COLORS[request.status] || ''}`}>
                  {request.status}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground font-medium">
                  <Clock className="mr-1 h-3 w-3" />
                  {format(new Date(request.requestedAt), 'PPP')}
                </div>
              </div>
              <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
                Seller Application
              </SheetTitle>
              <SheetDescription className="text-sm font-medium">
                ID: <span className="font-mono text-xs">{request.id.slice(0, 8)}...</span> • Submitted by {request.fullName}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-6 h-[calc(100vh-180px)] overflow-y-auto space-y-8 scrollbar-thin">
            {/* Identity & Contact Section */}
            <section className="space-y-4">
              <h3 className="flex items-center text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                <User className="mr-2 h-3.5 w-3.5 text-primary" /> Personal Profile
              </h3>
              
              <div className="grid grid-cols-2 gap-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-semibold">{request.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold break-all text-primary underline underline-offset-4">{request.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contact Number</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                    {request.personalPhone || request.phone || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alternate Phone</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                    {request.alternatePhone || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gender</p>
                  <p className="text-sm font-semibold capitalize">{request.gender || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preferred Language</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="uppercase">{request.preferredLanguage || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">KYC Verification</p>
                  <div className="flex gap-2 mt-1">
                    {request.aadhaar && <Badge variant="secondary" className="text-[10px] font-mono">Aadhaar: {request.aadhaar}</Badge>}
                    {request.pan && <Badge variant="secondary" className="text-[10px] font-mono">PAN: {request.pan}</Badge>}
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 p-5 rounded-2xl border border-dashed">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Personal Address</p>
                <div className="text-xs font-medium leading-relaxed text-muted-foreground italic">
                  {[
                    request.addressLine1,
                    request.addressLine2,
                    request.district,
                    request.city,
                    request.state,
                    request.pincode,
                    request.country
                  ].filter(Boolean).join(', ') || 'N/A'}
                </div>
              </div>
            </section>

            {/* Business Section */}
            <section className="space-y-4">
              <h3 className="flex items-center text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                <Building className="mr-2 h-3.5 w-3.5 text-primary" /> Storefront Details
              </h3>
              
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b bg-muted/10 flex justify-between items-start">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Store Name</p>
                      <h4 className="text-lg font-bold tracking-tight text-foreground">{request.shopName || 'Unnamed Shop'}</h4>
                    </div>

                    {request.shopHandle && (
                      <div>
                        <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-0.5">Shop Handle</p>
                        <code className="text-xs font-bold bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10">
                          @{request.shopHandle}
                        </code>
                      </div>
                    )}
                    
                    {request.businessName && request.businessName !== request.shopName && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Legal Business Name</p>
                        <p className="text-sm font-semibold">{request.businessName}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Seller Identity Type</p>
                      <p className="text-sm font-medium text-foreground/80">
                        {request.identityTypeLabel || (request.identityType ? IDENTITY_LABELS[request.identityType] : 'Standard Seller')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {request.shopLogoUrl && (
                      <div className="mb-2 h-16 w-16 rounded-xl border-2 border-primary/10 overflow-hidden bg-white shadow-sm p-1 group">
                        <img 
                          src={request.shopLogoUrl} 
                          alt="Shop Logo" 
                          className="h-full w-full object-contain rounded-lg group-hover:scale-110 transition-transform" 
                        />
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Business Category</p>
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 font-bold">
                      {request.businessTypes?.[0] || 'RETAIL'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">About Business</p>
                    <p className="text-sm leading-relaxed text-foreground/80 italic">
                      "{request.shopDescription || 'No description provided.'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Business Address</p>
                      <div className="text-xs font-medium text-muted-foreground leading-snug">
                        {[
                          request.storeAddressLine1,
                          request.storeAddressLine2,
                          request.storeDistrict,
                          request.storeCity,
                          request.storeState,
                          request.storePincode,
                          request.storeCountry
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </div>
                    </div>
                    {request.authorizedSignatory && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Authorized Signatory</p>
                        <p className="text-xs font-semibold">{request.authorizedSignatory}</p>
                      </div>
                    )}
                    {request.googleMapsUrl && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Map Link</p>
                        <a href={request.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                          <MapPin className="h-3 w-3" /> View Location <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Specialized Info Section */}
            {(request.identityType === 'FARMER' || request.warehouseLocation) && (
              <section className="space-y-4">
                <h3 className="flex items-center text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  <ShieldCheck className="mr-2 h-3.5 w-3.5 text-primary" /> Specialized Operations
                </h3>
                
                <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4 shadow-sm">
                  {request.identityType === 'FARMER' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Farm Location</p>
                        <p className="text-sm font-semibold">{request.farmLocation || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Land Area</p>
                        <p className="text-sm font-semibold">{request.landArea || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Crop Types</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.cropTypes?.map(crop => (
                            <Badge key={crop} variant="secondary" className="text-[10px]">{crop}</Badge>
                          )) || 'N/A'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Own Produce</p>
                        <Badge variant={request.isOwnProduce ? "default" : "outline"} className="text-[10px]">
                          {request.isOwnProduce ? 'Verified' : 'Reseller'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {request.warehouseLocation && (
                    <div className="space-y-1 pt-2 border-t border-dashed">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Warehouse Location</p>
                      <p className="text-sm font-semibold italic">"{request.warehouseLocation}"</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Legal & Banking Section */}
            <section className="space-y-4">
              <h3 className="flex items-center text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                <ShieldCheck className="mr-2 h-3.5 w-3.5 text-primary" /> Compliance & Finance
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-lg border shadow-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Tax / GSTIN</p>
                      <p className="text-sm font-mono font-bold tracking-tight">{request.gstin || request.taxId || 'N/A'}</p>
                    </div>
                  </div>
                  {request.businessLicense && (
                    <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold text-xs" asChild>
                      <a href={request.businessLicense} target="_blank" rel="noopener noreferrer">Review License</a>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border">
                  <div className="bg-background p-2 rounded-lg border shadow-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Bank Account ({request.bankIfscCode || 'IFSC N/A'})</p>
                    <p className="text-sm font-mono font-bold tracking-tight">{request.bankAccountNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Audit Trail Section */}
            {(request.approvedBy || request.rejectionReason) && (
              <section className="space-y-4 pt-4">
                <h3 className="flex items-center text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  <Clock className="mr-2 h-3.5 w-3.5 text-primary" /> Audit History
                </h3>
                <div className={`p-4 rounded-xl border border-dashed ${request.status === 'REJECTED' ? 'bg-rose-50/50 border-rose-200' : 'bg-muted/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={request.status === 'REJECTED' ? 'destructive' : 'secondary'} className="text-[9px] uppercase font-bold px-1.5 h-4">
                      {request.status}
                    </Badge>
                    <span className="text-[11px] font-medium text-muted-foreground italic">by {request.approvedBy || 'System'}</span>
                  </div>
                  {request.rejectionReason && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Rejection Note:
                      </p>
                      <p className="text-sm text-rose-700/80 dark:text-rose-400/80 font-medium leading-relaxed">
                        "{request.rejectionReason}"
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Action Footer */}
          {request.status === 'PENDING' && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => onReject(request.id)}
                disabled={isProcessing}
                className="h-12 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold"
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button
                onClick={() => onApprove(request.id)}
                disabled={isProcessing}
                className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20"
              >
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// Helper icon
function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
