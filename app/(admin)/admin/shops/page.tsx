'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Store,
  Search
} from 'lucide-react';

import { useAdminShops } from '@/features/admin/seller-requests/hooks/use-admin-shops';
import { AdminGuard } from '@/core/auth';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { AdminDataTable } from '@/shared/table/admin-data-table';
import { getColumns } from './columns';

export default function ShopsPage() {
  const {
    shops,
    isLoading,
    totalElements,
    totalPages,
    page,
    setPage,
    setKeyword,
    keyword
  } = useAdminShops();

  const [searchInput, setSearchInput] = useState('');

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
  };

  const columns = getColumns({
    onView: (shop) => console.log('View shop', shop),
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Shop Management"
          description={`Monitor and manage registered seller stores (${totalElements} total)`}
          icon={Store}
        />

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shops by name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={isLoading}>Search</Button>
              {(keyword || searchInput) && (
                <Button variant="ghost" onClick={() => { setSearchInput(''); setKeyword(''); }}>
                  Reset
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shops List</CardTitle>
            <CardDescription>Comprehensive list of all stores on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={columns}
              data={shops}
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
