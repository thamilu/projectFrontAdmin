'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, AlertTriangle, Check, X } from 'lucide-react';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { AdminProduct } from '@/features/admin/types';

interface ColumnProps {
  stockEdits: Record<number, number>;
  setStockEdits: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  onUpdateStock: (productId: number) => void;
  isUpdating: boolean;
}

export const getColumns = ({
  stockEdits,
  setStockEdits,
  onUpdateStock,
  isUpdating,
}: ColumnProps): ColumnDef<AdminProduct>[] => [
  {
    accessorKey: 'name',
    header: 'Product Info',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div>
          <div className="font-bold">{product.name}</div>
          <div className="text-xs text-muted-foreground font-mono">ID: {product.id}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => <span className="font-mono text-xs italic">{row.original.sku}</span>,
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row }) => <Badge variant="outline">{row.original.categoryName}</Badge>,
  },
  {
    accessorKey: 'stockQuantity',
    header: () => <div className="text-center">Current Stock</div>,
    cell: ({ row }) => {
      const stock = row.original.stockQuantity;
      return (
        <div className="flex items-center justify-center gap-2">
          <span className={`text-lg font-bold ${stock <= 10 ? 'text-destructive' : ''}`}>
            {stock}
          </span>
          {stock <= 10 && (
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
          )}
        </div>
      );
    },
  },
  {
    id: 'manageStock',
    header: 'Manage Stock',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="h-8 w-24"
            defaultValue={product.stockQuantity}
            onChange={(e) => setStockEdits(prev => ({
              ...prev,
              [product.id]: parseInt(e.target.value) || 0
            }))}
          />
          <Button
            size="sm"
            className="h-8 w-8 p-0"
            disabled={stockEdits[product.id] === undefined || isUpdating}
            onClick={() => onUpdateStock(product.id)}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    id: 'status',
    header: () => <div className="text-right">Status</div>,
    cell: ({ row }) => {
      const stock = row.original.stockQuantity;
      if (stock === 0) {
        return (
          <Badge variant="destructive" className="flex w-fit ml-auto items-center gap-1">
            <X className="h-3 w-3" /> Out
          </Badge>
        );
      }
      if (stock <= 10) {
        return (
          <Badge variant="outline" className="flex w-fit ml-auto items-center gap-1 border-orange-200 text-orange-700 bg-orange-50">
            <AlertTriangle className="h-3 w-3" /> Low
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="flex w-fit ml-auto items-center gap-1 border-green-200 text-green-700 bg-green-50">
          <Check className="h-3 w-3" /> Healthy
        </Badge>
      );
    },
  },
];
