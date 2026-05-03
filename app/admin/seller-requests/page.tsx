'use client';

import { useState } from 'react';
import { useSellerRequests } from '@/hooks/use-seller-requests';
import { getColumns } from './columns';
import { SellerDetailsDrawer } from '@/components/admin/seller-requests/seller-details-drawer';
import { RejectDialog } from '@/components/admin/seller-requests/reject-dialog';
import { SellerRequest } from '@/types/seller-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UserPlus,
  Search,
  Trash2,
  XCircle
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
  const [searchQuery, setSearchQuery] = useState('');

  // Handlers
  const handleView = (request: SellerRequest) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  const handleApprove = (id: string) => {
    approveRequest(id);
    if (isDrawerOpen && selectedRequest?.id === id) {
      setIsDrawerOpen(false);
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
    onApprove: handleApprove,
    onReject: handleRejectClick,
    isProcessing,
  });

  const filteredRequests = requests?.filter(r =>
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AdminGuard requireAdmin={false}>
      <div className="space-y-6">
        <AdminPageHeader
          title="Seller Requests"
          description="Manage and review incoming seller registration requests"
          icon={UserPlus}
        />

        <Card>
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by applicant or shop name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests List</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={columns}
              data={filteredRequests}
              isLoading={isLoading}
              // Since useSellerRequests doesn't provide pagination yet, we use defaults
              page={0}
              totalPages={1}
              totalElements={filteredRequests.length}
              onPageChange={() => { }}
            />
          </CardContent>
        </Card>
      </div>

      <SellerDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleRejectClick}
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
