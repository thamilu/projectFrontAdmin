/**
 * Order Management View Component
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

import { useAdminOrders } from '../hooks/use-admin-orders';
import type { AdminOrder, OrderStatus } from '../types';
import { AdminGuard } from '@/core/auth';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { AdminDataTable } from '@/shared/table/admin-data-table';
import { AdminStatCard } from '@/shared/ui/admin-stat-card';
import { getOrderColumns } from './order-columns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function OrderManagementView() {
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
    isUpdating,
  } = useAdminOrders();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    setKeyword(searchQuery);
  };

  const columns = getOrderColumns({
    onView: (order) => console.log('View order', order),
    onStatusChange: (orderId, newStatus) => updateStatus({ id: orderId, status: newStatus }),
    isUpdating,
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Order Management"
          description="Track and manage all system-wide customer orders"
          actions={
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Orders
            </Button>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="Total Orders" value={totalElements} icon={ShoppingBag} description="All time orders" />
          <AdminStatCard title="Pending" value={orders.filter((o: AdminOrder) => o.status === 'PENDING').length} icon={Clock} description="Awaiting action" color="text-yellow-500" />
          <AdminStatCard title="Completed" value={orders.filter((o: AdminOrder) => o.status === 'DELIVERED').length} icon={CheckCircle} description="Successfully delivered" color="text-green-500" />
          <AdminStatCard title="Cancelled" value={orders.filter((o: AdminOrder) => o.status === 'CANCELLED').length} icon={XCircle} description="Returned or voided" color="text-red-500" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order List</CardTitle>
            <CardDescription>
              Filter by status or search by order number
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search order number or customer..."
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
                  onValueChange={(val) => setFilters({ status: val === 'ALL' ? undefined : val as OrderStatus })}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
