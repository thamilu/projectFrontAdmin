/**
 * Product Management View Component
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Download, Package, Layers, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { useAdminProducts } from '../hooks/use-admin-products';
import type { AdminProduct, ProductStatus } from '../types';
import { AdminGuard } from '@/core/auth';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { AdminDataTable } from '@/shared/table/admin-data-table';
import { AdminStatCard } from '@/shared/ui/admin-stat-card';
import { getProductColumns } from './product-columns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProductManagementView() {
  const {
    products,
    isLoading,
    totalElements,
    totalPages,
    page,
    setPage,
    setKeyword,
    filters,
    setFilters,
  } = useAdminProducts();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    setKeyword(searchQuery);
  };

  const columns = getProductColumns({
    onView: (product) => console.log('View product', product),
    onEdit: (product) => console.log('Edit product', product),
    onDelete: (product) => console.log('Delete product', product),
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Product Management"
          description="Oversee the global product catalog and inventory"
          actions={
            <Button asChild className="gap-2">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </Button>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="Total Products" value={totalElements} icon={Package} description="Active in catalog" />
          <AdminStatCard title="Categories" value={12} icon={Layers} description="Active categories" color="text-blue-500" />
          <AdminStatCard title="Low Stock" value={5} icon={AlertCircle} description="Needs attention" color="text-red-500" />
          <AdminStatCard title="Published" value={products.filter((p: AdminProduct) => p.status === 'PUBLISHED').length} icon={CheckCircle} description="Live on store" color="text-green-500" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catalog Overview</CardTitle>
            <CardDescription>
              Filter and manage all products across all shops
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
              <div className="flex gap-2">
                <Select
                  value={filters.status || 'ALL'}
                  onValueChange={(val) => setFilters({ status: val === 'ALL' ? undefined : val as ProductStatus })}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <AdminDataTable
              columns={columns}
              data={products}
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
