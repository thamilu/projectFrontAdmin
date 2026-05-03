'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingBag,
  Search,
  Filter
} from 'lucide-react';

import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';
import { AdminGuard } from '@/components/admin/shared/admin-guard';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { AdminDataTable } from '@/components/admin/shared/admin-data-table';
import { AdminStatCard } from '@/components/admin/shared/admin-stat-card';
import { getColumns } from './columns';
import { ORDER_STATUS } from '@/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminOrdersPage() {
  const {
    orders,
    isLoading,
    totalElements,
    totalPages,
    page,
    setPage,
    setKeyword,
    filters,
    setFilters,
    updateStatus,
    isUpdating
  } = useAdminOrders();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    setKeyword(searchQuery);
  };

  const columns = getColumns({
    onView: (order) => console.log('View order', order),
    onStatusChange: (orderId, newStatus) => updateStatus({ id: orderId, status: newStatus }),
    isUpdating
  });

  // Calculate stats - using current order list for breakdown
  const stats = {
    total: totalElements,
    pending: orders.filter(o => o.status.toUpperCase() === ORDER_STATUS.PENDING).length,
    processing: orders.filter(o => [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(o.status.toUpperCase() as any)).length,
    shipped: orders.filter(o => o.status.toUpperCase() === ORDER_STATUS.SHIPPED).length,
    delivered: orders.filter(o => o.status.toUpperCase() === ORDER_STATUS.DELIVERED).length,
    cancelled: orders.filter(o => o.status.toUpperCase() === ORDER_STATUS.CANCELLED).length,
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Order Management"
          description="Monitor and manage all orders across the platform"
          icon={ShoppingBag}
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <AdminStatCard title="Total" value={stats.total} description="All orders" />
          <AdminStatCard title="Pending" value={stats.pending} description="Need action" color="text-yellow-600" />
          <AdminStatCard title="Processing" value={stats.processing} description="In progress" color="text-blue-600" />
          <AdminStatCard title="Shipped" value={stats.shipped} description="In transit" color="text-purple-600" />
          <AdminStatCard title="Delivered" value={stats.delivered} description="Completed" color="text-green-600" />
          <AdminStatCard title="Cancelled" value={stats.cancelled} description="Cancelled" color="text-red-600" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Filter className="h-5 w-5 text-primary" />
              Orders Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(val) => setFilters({ status: val === 'all' ? undefined : val })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders List</CardTitle>
            <CardDescription>
              Showing {orders.length} of {totalElements} orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={columns}
              data={orders}
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

