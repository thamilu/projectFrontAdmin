'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { AdminProduct } from '@/features/admin/types';

interface ColumnProps {
  onView: (product: AdminProduct) => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
}: ColumnProps): ColumnDef<AdminProduct>[] => [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {product.sku}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row }) => {
      const categoryName = row.original.categoryName;
      const getCategoryBadgeColor = (name: string) => {
        const colors: Record<string, string> = {
          'Electronics': 'bg-blue-100 text-blue-800',
          'Clothing': 'bg-purple-100 text-purple-800',
          'Food': 'bg-green-100 text-green-800',
          'Books': 'bg-amber-100 text-amber-800',
          'Home': 'bg-pink-100 text-pink-800',
        };
        return colors[name] || 'bg-gray-100 text-gray-800';
      };
      
      return (
        <Badge className={getCategoryBadgeColor(categoryName)}>
          {categoryName}
        </Badge>
      );
    },
  },
  {
    id: 'shop',
    header: 'Shop',
    cell: () => <div className="text-sm">Shop Name Placeholder</div>,
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => (
      <div className="font-semibold">
        ₹{row.original.price.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: 'stockQuantity',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.original.stockQuantity;
      const getStockStatusColor = (s: number) => {
        if (s === 0) return 'text-red-600';
        if (s < 10) return 'text-yellow-600';
        return 'text-green-600';
      };
      return (
        <span className={getStockStatusColor(stock)}>
          {stock} units
        </span>
      );
    },
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
      const product = row.original;
      return (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => onView(product)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(product)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
