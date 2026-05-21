'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SellerRequest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Loader2,
  Globe,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const IDENTITY_LABELS: Record<string, string> = {
    INDIVIDUAL: 'Individual Seller',
    BUSINESS: 'Registered Business',
    FARMER: 'Farmer / Producer',
  };

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl h-full p-0 border-l border-border/50 shadow-2xl overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl">
        {/* Cinematic Header Area - Compacted */}
        <div className="relative overflow-hidden bg-muted/30 px-6 py-6 border-b border-border/50 shrink-0">
          {/* Animated Mesh Gradients */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] duration-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm animate-scan" />
          
          <SheetHeader className="text-left relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-primary via-purple-500 to-blue-600 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                  <Avatar className="h-14 w-14 border-2 border-background shadow-2xl relative">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.fullName}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                      {request.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-background h-6 w-6 rounded-full shadow-lg flex items-center justify-center">
                    <Check className="h-3 w-3 text-white stroke-[4px]" />
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 backdrop-blur-md px-3 py-1 font-black text-[10px] tracking-[0.2em] uppercase mb-2 animate-pulse">
                    {request.status} REQUEST
                  </Badge>
                  <SheetTitle className="text-2xl font-black tracking-tighter text-foreground leading-none mb-1">
                    Seller Console
                  </SheetTitle>
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">v2.0 Verified</span>
                    <span>System ID: {request.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end text-[10px] font-black text-muted-foreground bg-background/40 px-3 py-2 rounded-xl border border-border/50 backdrop-blur-md shadow-inner">
                <span className="text-primary flex items-center gap-1.5 mb-0.5 uppercase tracking-widest"><Clock className="h-3 w-3" /> Entry Timestamp</span>
                <span className="text-foreground text-[11px]">{format(new Date(request.requestedAt), 'PPP p')}</span>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Tabbed Inspection Console */}
        <Tabs defaultValue="identity" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-6 pt-4 shrink-0 bg-muted/10 border-b border-border/50">
            <TabsList className="grid grid-cols-4 w-full h-12 bg-background/50 border border-border/50 p-1 rounded-xl backdrop-blur-md shadow-inner">
              <TabsTrigger value="identity" className="rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                <User className="h-3.5 w-3.5 mr-2" /> Identity
              </TabsTrigger>
              <TabsTrigger value="storefront" className="rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                <Building className="h-3.5 w-3.5 mr-2" /> Storefront
              </TabsTrigger>
              <TabsTrigger value="operations" className="rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                <Globe className="h-3.5 w-3.5 mr-2" /> Logistics
              </TabsTrigger>
              <TabsTrigger value="compliance" className="rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Finance
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-muted/10 hover:scrollbar-thumb-primary/60 transition-colors">
            <div className="space-y-10 pb-20">
            {/* Identity Tab Content */}
            <TabsContent value="identity" className="space-y-8 mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                <div className="relative bg-card/40 backdrop-blur-md p-8 rounded-[2rem] border border-border/50 shadow-2xl space-y-6 overflow-hidden">
                  {/* Background Watermark */}
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-[0.03] rotate-12 pointer-events-none">
                    <User className="h-64 w-64" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-[0.25em]">Full Legal Name</p>
                      <p className="text-xl font-black tracking-tight text-foreground">{request.fullName}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-[0.25em]">Contact Vector</p>
                      <div className="flex items-center gap-2 group/item cursor-pointer" onClick={() => handleCopy(request.email, 'Email')}>
                        <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover/item:scale-110 transition-transform"><Smartphone className="h-4 w-4" /></div>
                        <p className="text-sm font-bold text-foreground/80 group-hover/item:text-primary transition-colors">{request.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.25em]">Contact Channels</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 group/item cursor-pointer" onClick={() => handleCopy(request.personalPhone || '', 'Personal Phone')}>
                          <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 group-hover/item:scale-110 transition-transform"><Smartphone className="h-3.5 w-3.5" /></div>
                          <p className="text-xs font-bold text-foreground/80 group-hover/item:text-emerald-600 transition-colors">Personal: {request.personalPhone || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2 group/item cursor-pointer" onClick={() => handleCopy(request.alternatePhone || '', 'Alternate Phone')}>
                          <div className="p-1.5 bg-slate-500/10 rounded-lg text-slate-600 group-hover/item:scale-110 transition-transform"><Smartphone className="h-3.5 w-3.5" /></div>
                          <p className="text-xs font-bold text-foreground/80 group-hover/item:text-slate-600 transition-colors">Alternate: {request.alternatePhone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.25em]">Demographics</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-muted font-black text-[10px] px-3">{request.gender || 'N/A'}</Badge>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] px-3 flex items-center gap-1 uppercase">
                          <Languages className="h-3 w-3" /> {request.preferredLanguage || 'EN'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/50 border-dashed space-y-4">
                    <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.35em] flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> KYC Verification Suite
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {request.aadhaar && (
                        <div 
                          className="flex items-center justify-between bg-emerald-500/5 text-emerald-600 border border-emerald-500/20 p-4 rounded-2xl group/kyc cursor-pointer hover:bg-emerald-500/10 transition-all"
                          onClick={() => handleCopy(request.aadhaar!, 'Aadhaar')}
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Aadhaar (UIDAI)</span>
                            <p className="text-sm font-black">{request.aadhaar}</p>
                          </div>
                          <Check className="h-5 w-5 opacity-40 group-hover/kyc:scale-125 transition-transform" />
                        </div>
                      )}
                      {request.pan && (
                        <div 
                          className="flex items-center justify-between bg-emerald-500/5 text-emerald-600 border border-emerald-500/20 p-4 rounded-2xl group/kyc cursor-pointer hover:bg-emerald-500/10 transition-all"
                          onClick={() => handleCopy(request.pan!, 'PAN')}
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Permanent Account Num</span>
                            <p className="text-sm font-black">{request.pan}</p>
                          </div>
                          <Check className="h-5 w-5 opacity-40 group-hover/kyc:scale-125 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Storefront Tab Content */}
            <TabsContent value="storefront" className="space-y-8 mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden group">
                <div className="p-10 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5 flex justify-between items-start">
                  <div className="space-y-6">
                    <div>
                      <Badge className="bg-primary/20 text-primary border-none shadow-none px-3 py-1 font-bold text-[10px] tracking-widest mb-3">
                        BRAND IDENTITY
                      </Badge>
                      <h4 className="text-4xl font-black tracking-tighter text-foreground leading-none">{request.shopName || 'Unnamed Shop'}</h4>
                      {request.shopHandle && (
                        <div className="mt-4 flex items-center gap-2">
                          <code className="text-xs font-black bg-foreground text-background px-4 py-1.5 rounded-full shadow-2xl">
                            @{request.shopHandle}
                          </code>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-10 gap-y-4">
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Entity Structure</p>
                        <p className="text-sm font-bold text-foreground">
                          {request.identityTypeLabel || (request.identityType ? IDENTITY_LABELS[request.identityType] : 'Premium Retailer')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Business Contact</p>
                        <div 
                          className="flex items-center gap-2 text-sm font-bold text-primary cursor-pointer hover:underline"
                          onClick={() => handleCopy(request.businessPhone || request.phone || '', 'Business Phone')}
                        >
                          <Smartphone className="h-3.5 w-3.5" /> {request.businessPhone || request.phone || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Trade Name</p>
                        <p className="text-sm font-bold text-foreground underline decoration-primary/40 decoration-2 underline-offset-4">
                          {request.businessName || request.fullName}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="h-20 w-20 rounded-2xl border-2 border-background overflow-hidden bg-white shadow-xl p-2 relative group/logo">
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover/logo:opacity-10 transition-opacity" />
                      <img 
                        src={request.shopLogoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${request.shopName}`} 
                        alt="Shop Logo" 
                        className="h-full w-full object-contain rounded-xl transition-transform duration-700 group-hover/logo:scale-110" 
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Operation Category</p>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none shadow-xl shadow-emerald-500/20 px-4 py-2 font-bold text-[11px] tracking-widest uppercase">
                        {request.businessTypes?.[0] || 'RETAILER'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-10 space-y-8 bg-background/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className="text-[12px] font-bold text-primary uppercase tracking-[0.3em]">Corporate Bio & Mission</p>
                    </div>
                    <div className="relative p-6 bg-muted/30 rounded-3xl border border-border/50 border-dashed">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <MessageSquare className="h-24 w-24" />
                      </div>
                      <p className="text-base leading-relaxed text-foreground/80 font-medium italic break-words">
                        &quot;{request.shopDescription || 'The applicant has not provided a mission statement yet.'}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Logistics Tab Content */}
            <TabsContent value="operations" className="space-y-8 mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 gap-6">
                {/* Store Location */}
                <div className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 p-8 space-y-6 shadow-xl group overflow-hidden relative">
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <Building className="h-64 w-64" />
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Building className="h-5 w-5" /></div>
                        <h5 className="font-bold text-sm uppercase tracking-widest">Base of Operations</h5>
                      </div>
                      <div 
                        className="text-lg font-bold leading-tight text-foreground/90 hover:text-primary cursor-pointer transition-colors max-w-md"
                        onClick={() => handleCopy([request.storeAddressLine1, request.storeCity, request.storePincode].filter(Boolean).join(', '), 'Store Address')}
                      >
                        {[
                          request.storeAddressLine1,
                          request.storeAddressLine2,
                          request.storeDistrict,
                          request.storeCity,
                          request.storeState,
                          request.storePincode,
                          request.storeCountry
                        ].filter(Boolean).join(', ') || 'Global Distribution Center'}
                      </div>
                    </div>
                    {request.googleMapsUrl && (
                      <Button variant="outline" className="h-14 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-background/50 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg group/btn" asChild>
                        <a href={request.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                          <MapPin className="h-4 w-4 mr-2 group-hover/btn:scale-125 transition-transform" /> GPS VERIFY <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Residential Address */}
                <div className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 p-8 space-y-6 shadow-xl group overflow-hidden relative">
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <MapPin className="h-64 w-64" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500"><MapPin className="h-5 w-5" /></div>
                      <h5 className="font-bold text-sm uppercase tracking-widest">Primary Residence</h5>
                    </div>
                    <div 
                      className="text-lg font-bold leading-tight text-foreground/90 hover:text-rose-500 cursor-pointer transition-colors max-w-md"
                      onClick={() => handleCopy([request.addressLine1, request.city, request.pincode].filter(Boolean).join(', '), 'Residential Address')}
                    >
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
                </div>
              </div>
            </TabsContent>

            {/* Compliance Tab Content */}
            <TabsContent value="compliance" className="space-y-8 mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 gap-4">
                <div className="group relative bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 p-8 shadow-xl flex items-center justify-between hover:border-primary/40 transition-all overflow-hidden">
                   <div className="absolute top-0 right-0 -mr-5 -mt-5 opacity-[0.02] pointer-events-none">
                    <FileText className="h-48 w-48" />
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="h-16 w-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
                      <Briefcase className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Commercial Tax ID / GSTIN</p>
                      <p 
                        className="text-2xl font-mono font-black tracking-tighter text-foreground group-hover:text-primary cursor-pointer transition-colors"
                        onClick={() => handleCopy(request.gstin || request.taxId || '', 'Tax ID')}
                      >
                        {request.gstin || request.taxId || 'UNREGISTERED'}
                      </p>
                    </div>
                  </div>
                  {request.businessLicense && (
                    <Button variant="outline" className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-background/50 relative z-10" asChild>
                      <a href={request.businessLicense} target="_blank" rel="noopener noreferrer">
                        VIEW LICENSE <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="group relative bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 p-8 shadow-xl flex items-center gap-6 hover:border-purple-500/40 transition-all overflow-hidden">
                   <div className="absolute top-0 right-0 -mr-5 -mt-5 opacity-[0.02] pointer-events-none">
                    <CreditCard className="h-48 w-48" />
                  </div>
                  <div className="h-16 w-16 bg-purple-500/10 rounded-[1.5rem] flex items-center justify-center text-purple-500 shadow-inner group-hover:scale-110 transition-transform relative z-10">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Financial Settlement Ledger</p>
                    <div className="flex items-center justify-between">
                      <p 
                        className="text-2xl font-mono font-black tracking-tighter text-foreground group-hover:text-purple-500 cursor-pointer transition-colors"
                        onClick={() => handleCopy(request.bankAccountNumber || '', 'Account Number')}
                      >
                        {request.bankAccountNumber ? `**** **** ${request.bankAccountNumber.slice(-4)}` : 'N/A'}
                      </p>
                      <Badge variant="outline" className="bg-purple-500/5 text-purple-500 border-purple-500/20 font-black text-[10px] px-4 py-1 tracking-widest rounded-full">
                        IFSC: {request.bankIfscCode || 'UNSET'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Intelligence Panel */}
              {(request.approvedBy || request.rejectionReason) && (
                <div className={cn(
                  "relative p-8 rounded-[2rem] border-2 shadow-2xl overflow-hidden group/audit",
                  request.status === 'REJECTED' ? "bg-rose-500/5 border-rose-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                )}>
                   <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-[0.05] -rotate-12">
                    <ShieldCheck className="h-64 w-64" />
                  </div>
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <Badge className={cn(
                      "text-[11px] uppercase font-bold px-6 py-2 h-auto tracking-widest border-none shadow-xl",
                      request.status === 'REJECTED' ? "bg-rose-500 shadow-rose-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                    )}>
                      {request.status}
                    </Badge>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Audit Supervisor</span>
                      <span className="text-sm font-black text-foreground">{request.approvedBy || 'SYSTEM_VERIFIER'}</span>
                    </div>
                  </div>
                  {request.rejectionReason && (
                    <div className="space-y-3 relative z-10">
                      <div className="text-[11px] font-bold text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Intelligence Briefing
                      </div>
                      <div className="p-6 bg-background/50 rounded-2xl border border-rose-500/20 backdrop-blur-sm">
                        <p className="text-base text-rose-600 dark:text-rose-400 font-bold leading-relaxed italic">
                          &quot;{request.rejectionReason}&quot;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Tactical Action Footer - Compacted */}
        {request.status === 'PENDING' && (
          <div className="shrink-0 p-4 sm:p-6 bg-background/80 backdrop-blur-2xl border-t border-border/50 grid grid-cols-2 gap-4 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
            <Button
              variant="outline"
              onClick={() => onReject(request.id)}
              disabled={isProcessing}
              className="h-12 rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-transparent transition-colors" />
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <X className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />}
              Reject Access
            </Button>
            <Button
              onClick={() => onApprove(request.id)}
              disabled={isProcessing}
              className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white font-bold uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer pointer-events-none" />
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5 group-hover:scale-125 transition-transform duration-500" />}
              Grant Approval
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Helper icon
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
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
