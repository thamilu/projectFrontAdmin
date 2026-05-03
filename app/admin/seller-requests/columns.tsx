'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle2, XCircle, Clock, AlertCircle, HelpCircle } from 'lucide-react';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { SellerRequest } from '@/types/seller-request';
import { Checkbox } from '@/components/ui/checkbox';

interface ColumnProps {
  onView: (request: SellerRequest) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
}

export const getColumns = ({
  onView,
  onApprove,
  onReject,
  isProcessing,
}: ColumnProps): ColumnDef<SellerRequest>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'fullName',
      header: 'Applicant',
      cell: ({ row }) => <div className="font-medium">{row.original.fullName}</div>,
    },
    {
      accessorKey: 'shopName',
      header: 'Shop Name',
    },
    {
      accessorKey: 'identityType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.identityType?.toLowerCase().replace('_', ' ') || 'N/A'}
        </Badge>
      ),
    },
    {
      accessorKey: 'requestedAt',
      header: 'Requested On',
      cell: ({ row }) => new Date(row.original.requestedAt).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const request = row.original;
        const isPending = request.status === 'PENDING';

        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onView(request)} title="View Details">
              <Eye className="h-4 w-4" />
            </Button>
            {isPending && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700"
                  onClick={() => onApprove(request.id)}
                  disabled={isProcessing}
                  title="Approve"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onReject(request.id)}
                  disabled={isProcessing}
                  title="Reject"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];
