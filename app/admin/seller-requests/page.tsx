'use client';

import { useState } from 'react';
import { useSellerRequests } from '@/hooks/use-seller-requests';
import { getColumns } from './columns';
import { SellerDetailsDrawer } from '@/components/admin/seller-requests/seller-details-drawer';
import { RejectDialog } from '@/components/admin/seller-requests/reject-dialog';
import { ApproveDialog } from '@/components/admin/seller-requests/approve-dialog';
import { SellerRequest } from '@/types/seller-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UserPlus,
  Search,
  Trash2,
  XCircle,
  AlertCircle
} from 'lucide-react';

import { AdminGuard } from '@/components/admin/shared/admin-guard';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { AdminDataTable } from '@/components/admin/shared/admin-data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SellerRequestsPage() {
  const { requests, isLoading, approveRequest, rejectRequest, isProcessing } =
    useSellerRequests();

  // Drawer & Dialog State
  const [selectedRequest, setSelectedRequest] = useState<SellerRequest | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handlers
  const handleView = (request: SellerRequest) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  const handleApproveClick = (id: string) => {
    setRequestToApprove(id);
    setIsApproveDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    if (requestToApprove) {
      approveRequest(requestToApprove);
      setIsApproveDialogOpen(false);
      setRequestToApprove(null);
      if (isDrawerOpen && selectedRequest?.id === requestToApprove) {
        setIsDrawerOpen(false);
      }
    }
  };

  const handleRejectClick = (id: string) => {
    setRequestToReject(id);
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = (reason: string) => {
    if (requestToReject) {
      rejectRequest(requestToReject, reason);
      setIsRejectDialogOpen(false);
      setRequestToReject(null);
      if (isDrawerOpen && selectedRequest?.id === requestToReject) {
        setIsDrawerOpen(false);
      }
    }
  };

  const columns = getColumns({
    onView: handleView,
    onApprove: handleApproveClick,
    onReject: handleRejectClick,
    isProcessing,
  });

  const filteredRequests = requests?.filter(r =>
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AdminGuard requireAdmin={false}>
      <div className="space-y-8 animate-in fade-in duration-700">
        <AdminPageHeader
          title="Seller Requests"
          description="Manage and review incoming seller registration requests with high-precision oversight"
          icon={UserPlus}
        />

        <div className="grid gap-6 animate-in slide-in-from-bottom-4 duration-1000 delay-200">
          <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                Search Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 group/search">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/search:text-primary transition-colors duration-300" />
                  <Input
                    placeholder="Filter by applicant or shop name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300 rounded-xl"
                  />
                </div>
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchQuery('')}
                    className="h-11 px-4 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tight">Requests Pipeline</CardTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-primary" /> Hint: Select a row or click the eye icon to inspect details
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {filteredRequests.length} Total Requests
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AdminDataTable
                columns={columns}
                data={filteredRequests}
                isLoading={isLoading}
                page={0}
                totalPages={1}
                totalElements={filteredRequests.length}
                onPageChange={() => { }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <SellerDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        request={selectedRequest}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
        isProcessing={isProcessing}
      />

      <ApproveDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        onConfirm={handleApproveConfirm}
        isProcessing={isProcessing}
      />

      <RejectDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        isProcessing={isProcessing}
      />
    </AdminGuard>
  );
}
