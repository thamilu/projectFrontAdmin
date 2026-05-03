'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  Search,
  Filter
} from 'lucide-react';

import { useAdminInventory } from '@/features/admin';
import { AdminGuard } from '@/components/admin/shared/admin-guard';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { AdminDataTable } from '@/components/admin/shared/admin-data-table';
import { getColumns } from './columns';

export default function AdminInventoryPage() {
  const {
    inventory,
    isLoading,
    totalElements,
    totalPages,
    page,
    setPage,
    setKeyword,
    filters,
    setFilters,
    updateStock,
    isUpdating
  } = useAdminInventory();

  // Local state for stock inputs before save and search query
  const [stockEdits, setStockEdits] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleStockUpdate = (productId: number) => {
    const newQuantity = stockEdits[productId];
    if (newQuantity === undefined) return;

    updateStock({
      id: productId,
      data: { quantity: newQuantity, operation: 'SET' }
    }, {
      onSuccess: () => {
        setStockEdits(prev => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      }
    });
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchQuery);
  };

  const columns = getColumns({
    stockEdits,
    setStockEdits,
    onUpdateStock: handleStockUpdate,
    isUpdating
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Inventory Monitor"
          description="Real-time stock tracking and management across all products"
          icon={Package}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total SKUs"
            value={inventory.length}
            color="bg-blue-50/50 border-blue-100 text-blue-600"
          />
          <Card className="bg-orange-50/50 border-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-end">
              <div className="text-2xl font-bold text-orange-700">
                {inventory.filter(i => i.stockQuantity <= 10).length}
              </div>
              <Button
                variant="link"
                className="h-auto p-0 text-orange-600 text-xs"
                onClick={() => setFilters({ lowStockOnly: !filters.lowStockOnly })}
              >
                {filters.lowStockOnly ? 'Show All' : 'Filter Low Stock'}
              </Button>
            </CardContent>
          </Card>
          <StatCard
            title="Out of Stock"
            value={inventory.filter(i => i.stockQuantity === 0).length}
            color="bg-red-50/50 border-red-100 text-red-600"
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              {(searchQuery || filters.productName) && (
                <Button variant="ghost" onClick={() => { setSearchQuery(''); setKeyword(''); setFilters({ productName: '' }); }}>
                  Reset
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Control</CardTitle>
            <CardDescription>Update product quantities and monitor availability</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={columns}
              data={inventory}
              isLoading={isLoading}
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}

function StatCard({ title, value, color }: any) {
  return (
    <Card className={color}>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
