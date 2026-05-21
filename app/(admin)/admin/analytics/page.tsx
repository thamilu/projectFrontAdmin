'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminAnalytics } from '@/features/admin/analytics/hooks/use-admin-analytics';
import { useAdminDashboard } from '@/features/admin/analytics/hooks/use-admin-dashboard';
import { PaymentAnalyticsCard } from '@/features/admin/analytics/components/payment-analytics-card';
import { StatsCards } from '@/features/admin/analytics/components/stats-cards';
import { AdminGuard } from '@/core/auth';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const {
    isLoading: analyticsLoading,
    isError: analyticsError
  } = useAdminAnalytics(period);

  const {
    data: dashboardData,
    isLoading: statsLoading,
    isError: statsError
  } = useAdminDashboard();

  const stats = dashboardData?.overview;
  const userStats = dashboardData?.userStats;

  if (analyticsError || statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load analytics</h2>
        <p className="text-muted-foreground">There was an error fetching the data from the server.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Analytics Overview"
          description="Detailed performance metrics and trends across the platform"
          icon={BarChart3}
          actions={
            <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
              {(['day', 'week', 'month', 'year'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className="h-8 text-xs capitalize"
                >
                  {p}
                </Button>
              ))}
            </div>
          }
        />

        {statsLoading || analyticsLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <StatsCards
              overview={stats}
              userStats={userStats}
              isLoading={statsLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue & Orders Trend</CardTitle>
                  <CardDescription>Visual representation of growth over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed m-6 mt-2">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium">Interactive Charts Implementation</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                      Data for {period}ly period ready for visualization.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <PaymentAnalyticsCard isLoading={analyticsLoading} />

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      Top Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium text-sm">Product Name Placeholder {i}</p>
                            <p className="text-xs text-muted-foreground">Category Name</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">₹{(1500 * (6 - i)).toLocaleString()}</p>
                            <p className="text-[10px] text-green-600">+{10 - i}% growth</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}
