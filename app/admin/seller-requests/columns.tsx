'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle2, XCircle, Clock, AlertCircle, HelpCircle } from 'lucide-react';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { SellerRequest } from '@/types/seller-request';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      cell: ({ row }) => (
        <div 
          className="flex items-center gap-3 cursor-pointer group/applicant"
          onClick={() => onView(row.original)}
          title="Click to view full details"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover/applicant:opacity-100 transition-opacity" />
            <Avatar className="h-9 w-9 border-2 border-border/50 shadow-sm relative">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.original.fullName}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {row.original.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground leading-tight group-hover/applicant:text-primary transition-colors">{row.original.fullName}</span>
            <span className="text-[11px] text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'shopName',
      header: 'Shop Name',
    },
    {
      accessorKey: 'shopHandle',
      header: 'Handle',
      cell: ({ row }) => (
        <code className="text-[11px] font-black bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-full backdrop-blur-sm tracking-tight">
          @{row.original.shopHandle || 'no-handle'}
        </code>
      ),
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
          <TooltipProvider>
            <div className="flex justify-end gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(request)}
                      className="h-8 px-3 hover:bg-primary/10 hover:text-primary transition-all duration-300 gap-2 font-bold text-xs"
                      aria-label={`View full details for ${request.fullName}`}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>

              {isPending && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all duration-300"
                        onClick={() => onApprove(request.id)}
                        disabled={isProcessing}
                        aria-label={`Approve registration for ${request.fullName}`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Approve Seller</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all duration-300"
                        onClick={() => onReject(request.id)}
                        disabled={isProcessing}
                        aria-label={`Reject registration for ${request.fullName}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reject Request</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </TooltipProvider>
        );
      },
    },
  ];
