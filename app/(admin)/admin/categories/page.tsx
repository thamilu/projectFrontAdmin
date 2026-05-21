'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  LayoutGrid
} from 'lucide-react';

import { useAdminCategories, useAdminCategoryRequests } from '@/features/admin/products/hooks/use-admin-categories';
import type { AdminCategory, CategoryRequest } from '@/features/admin/products/types';
import { AdminGuard } from '@/core/auth';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';

export default function AdminCategoriesPage() {
  const {
    categories,
    isLoading: categoriesLoading,
    create,
    remove,
    isCreating,
    isDeleting
  } = useAdminCategories();

  const {
    requests,
    isLoading: requestsLoading,
    review,
    isReviewing
  } = useAdminCategoryRequests();

  const [newCategory, setNewCategory] = useState('');
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    create(newCategory.trim(), {
      onSuccess: () => setNewCategory('')
    });
  };

  const handleReview = (requestId: number, approved: boolean) => {
    review({
      id: requestId,
      review: {
        approved,
        remarks: remarks[requestId] || (approved ? 'Approved by admin' : 'Rejected by admin')
      }
    });
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Categories & Approvals"
          description="Manage global categories and review seller category requests"
          icon={LayoutGrid}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Management */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Global Categories</CardTitle>
                <CardDescription>Add or remove product categories for the entire shop</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                  <Input
                    placeholder="Enter new category name..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    disabled={isCreating}
                    required
                  />
                  <Button type="submit" disabled={isCreating || !newCategory.trim()}>
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Add
                  </Button>
                </form>

                {categoriesLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Category Name</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category: AdminCategory) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-mono text-xs">{category.id}</TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this category?')) {
                                    remove(category.id);
                                  }
                                }}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {categories.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">
                              No categories found. Start by adding one above.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Requests */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Seller Requests</CardTitle>
                  <CardDescription>New category requests from users that need review</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {requests.length} Pending
                </Badge>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-20 border rounded-lg border-dashed">
                    <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">All caught up!</h3>
                    <p className="text-muted-foreground">No pending category requests to review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request: CategoryRequest) => (
                      <div key={request.id} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-lg">{request.categoryName}</div>
                            <div className="text-sm text-muted-foreground font-medium">Requested by: {request.sellerName}</div>
                          </div>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending Review</Badge>
                        </div>

                        <div className="bg-background p-3 rounded border text-sm mb-4">
                          <span className="font-semibold block mb-1">Reason:</span>
                          {request.reason}
                        </div>

                        <div className="space-y-3">
                          <Input
                            placeholder="Add review remarks..."
                            className="text-sm bg-background"
                            value={remarks[request.id] || ''}
                            onChange={(e) => setRemarks(prev => ({ ...prev, [request.id]: e.target.value }))}
                          />
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              size="sm"
                              onClick={() => handleReview(request.id, true)}
                              disabled={isReviewing}
                            >
                              <Check className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              size="sm"
                              onClick={() => handleReview(request.id, false)}
                              disabled={isReviewing}
                            >
                              <X className="h-4 w-4 mr-2" /> Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
