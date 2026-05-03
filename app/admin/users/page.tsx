'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  UserPlus,
  Filter,
  Download,
  Users,
  Shield,
  Store,
  Truck,
  ShoppingCart
} from 'lucide-react';

import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { AdminGuard } from '@/components/admin/shared/admin-guard';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { AdminDataTable } from '@/components/admin/shared/admin-data-table';
import { AdminStatCard } from '@/components/admin/shared/admin-stat-card';
import { getColumns } from './columns';
import { USER_ROLES } from '@/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminUsersPage() {
  const {
    users,
    isLoading,
    totalElements,
    totalPages,
    page,
    setPage,
    setKeyword,
    filters,
    setFilters,
    updateStatus,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    setKeyword(searchQuery);
  };

  const columns = getColumns({
    onView: (user) => console.log('View user', user),
    onEdit: (user) => console.log('Edit user', user),
    onToggleStatus: (userId, currentStatus) => updateStatus({ id: userId, active: !currentStatus }),
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="User Management"
          description="Manage all users, sellers, delivery agents, and customers"
          actions={
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatCard title="Total Users" value={totalElements} icon={Users} description="Across all roles" />
          <AdminStatCard title="Sellers" value={users.filter(u => u.role === USER_ROLES.SELLER).length} icon={Store} description="All seller types" color="text-blue-500" />
          <AdminStatCard title="Admins" value={users.filter(u => u.role === USER_ROLES.ADMIN).length} icon={Shield} description="System admins" color="text-red-500" />
          <AdminStatCard title="Agents" value={users.filter(u => u.role === USER_ROLES.DELIVERY_AGENT).length} icon={Truck} description="Active drivers" color="text-green-500" />
          <AdminStatCard title="Customers" value={users.filter(u => u.role === USER_ROLES.CUSTOMER).length} icon={ShoppingCart} description="Shopping users" color="text-purple-500" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage all registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or username..."
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
                  value={filters.role || 'ALL'}
                  onValueChange={(val) => setFilters({ role: val === 'ALL' ? undefined : val })}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SELLER">Seller</SelectItem>
                    <SelectItem value="DELIVERY_AGENT">Delivery Agent</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
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
              data={users}
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

