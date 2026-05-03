'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Calendar, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { AdminShop } from '@/features/admin/types';
import { SHOP_STATUS } from '@/constants';

interface ColumnProps {
  onView: (shop: AdminShop) => void;
}

export const getColumns = ({
  onView,
}: ColumnProps): ColumnDef<AdminShop>[] => [
  {
    accessorKey: 'shopName',
    header: 'Shop Details',
    cell: ({ row }) => {
      const shop = row.original;
      return (
        <div>
          <div className="font-bold text-base">{shop.shopName}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {shop.address || 'No address provided'}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" />
            Joined: {new Date(shop.createdAt).toLocaleDateString()}
          </div>
        </div>
      );
    },
  },
  {
    id: 'sellerInfo',
    header: 'Seller Info',
    cell: ({ row }) => {
      const shop = row.original;
      return (
        <div>
          <div className="font-medium">{shop.sellerName}</div>
          <Badge variant="outline" className="text-[10px] h-5 mt-1">ID: {shop.id}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'sellerType',
    header: 'Type',
    cell: ({ row }) => (
      <StatusBadge status={row.original.sellerType} />
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Contact',
    cell: ({ row }) => (
      <div className="text-sm flex items-center gap-2">
        <Phone className="h-3 w-3 text-muted-foreground" />
        {row.original.phoneNumber}
      </div>
    ),
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.original.active ? SHOP_STATUS.ACTIVE : SHOP_STATUS.SUSPENDED} />
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Button variant="ghost" size="sm" className="hover:text-primary" onClick={() => onView(row.original)}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
