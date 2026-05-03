'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  Search,
  Filter,
  Plus
} from 'lucide-react';

import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts';
import { AdminGuard } from '@/components/admin/shared/admin-guard';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { AdminDataTable } from '@/components/admin/shared/admin-data-table';
import { getColumns } from './columns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminProductsPage() {
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

  const columns = getColumns({
    onView: (product) => console.log('View product', product),
    onEdit: (product) => console.log('Edit product', product),
    onDelete: (product) => console.log('Delete product', product),
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Product Management"
          description="Manage all products across the platform"
          icon={Package}
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Products" value={totalElements} description="Across all sellers" />
          <StatCard title="Active" value={products.filter(p => p.active).length} description="Currently selling" color="text-green-600" />
          <StatCard title="Low Stock" value={products.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0).length} description="Need restocking" color="text-yellow-600" />
          <StatCard title="Out of Stock" value={products.filter(p => p.stockQuantity === 0).length} description="Unavailable" color="text-red-600" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Filter className="h-5 w-5 text-primary" />
              Product Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.status || 'all'}
                onValueChange={(val) => setFilters({ status: val === 'all' ? undefined : val as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Select
                  value={filters.isFeatured?.toString() || 'all'}
                  onValueChange={(val) => setFilters({ isFeatured: val === 'all' ? undefined : val === 'true' })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Featured</SelectItem>
                    <SelectItem value="true">Featured Only</SelectItem>
                    <SelectItem value="false">Regular Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products List</CardTitle>
            <CardDescription>
              Showing {products.length} of {totalElements} products
            </CardDescription>
          </CardHeader>
          <CardContent>
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

function StatCard({ title, value, description, color }: any) {
  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`text-2xl font-bold ${color || ''}`}>{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
