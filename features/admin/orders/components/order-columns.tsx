/**
 * Order Table Columns
 */

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Package 
} from 'lucide-react';
import { StatusBadge } from '@/shared/ui/status-badge';
import type { AdminOrder, OrderStatus } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ColumnProps {
  onView: (order: AdminOrder) => void;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
  isUpdating: boolean;
}

export const getOrderColumns = ({
  onView,
  onStatusChange,
  isUpdating,
}: ColumnProps): ColumnDef<AdminOrder>[] => [
  {
    accessorKey: 'orderNumber',
    header: 'Order Number',
    cell: ({ row }) => (
      <div className="font-mono font-semibold">{row.original.orderNumber}</div>
    ),
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'orderDate',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.orderDate);
      return (
        <div>
          <div className="text-sm">
            {date.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {date.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'items',
    header: 'Items',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.orderItems.length} items</span>
      </div>
    ),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => (
      <div className="font-semibold text-lg text-left">
        ₹{row.original.totalAmount.toFixed(2)}
      </div>
    ),
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
      const order = row.original;
      return (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => onView(order)} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          <Select
            value={order.status.toLowerCase()}
            onValueChange={(val) => onStatusChange(order.id, val.toUpperCase() as OrderStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    },
  },
];
