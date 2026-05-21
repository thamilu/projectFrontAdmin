'use client';

/**
 * AdminDashboard — progressive rendering
 *
 * Performance improvements applied:
 *  1. Full-page loading block removed — sections render immediately with inline skeletons
 *  2. Charts are lazy-loaded (React.lazy) so Recharts is split into a separate chunk
 *  3. refetchInterval raised to 5 min in use-admin-dashboard.ts
 *  4. API route now sets Cache-Control: private, max-age=10
 */

import { lazy, Suspense, useState } from 'react';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';
import { DashboardHeader } from './dashboard-header';
import { StatsCards } from './stats-cards';
import { RecentOrdersCard } from './recent-orders-card';
import { QuickActions } from './quick-actions';
import { NavigationCards } from './navigation-cards';
import { PaymentAnalyticsCard } from './payment-analytics-card';
import { AlertsCard } from './alerts-card';
import { InventoryAlertsCard } from './inventory-alerts-card';
import { ChartSkeleton } from './skeleton';
import { DashboardError } from './error';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DateRange } from '@/features/admin/analytics/types';

// ── Lazy-loaded charts ─────────────────────────────────────────────────────────
// Recharts is heavy (~130 kB). Splitting it out defers parse cost until the
// user actually reaches the charts section, improving Time-To-Interactive.
const OverviewSalesChart = lazy(() =>
  import('./charts/overview-sales-chart').then((m) => ({
    default: m.OverviewSalesChart,
  }))
);

const OrdersStatusDistChart = lazy(() =>
  import('./charts/orders-status-dist-chart').then((m) => ({
    default: m.OrdersStatusDistChart,
  }))
);
// ──────────────────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [dateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
    preset: 'last30days',
  });

  const { data, isLoading, isError, error, refresh, lastUpdated } =
    useAdminDashboard({ dateRange });

  // Only show full-page error when we have no cached data to fall back on
  if (isError && !data) {
    return <DashboardError error={error} onRetry={refresh} />;
  }

  // ── Progressive render ────────────────────────────────────────────────────
  // The page renders immediately. Every section handles its own loading state
  // by showing skeleton placeholders rather than blocking the whole layout.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6">
      {/* Header is always rendered first — no data dependency */}
      <DashboardHeader
        title="Dashboard"
        description="Overview of your store's performance"
        lastUpdated={lastUpdated}
        isFetching={isLoading}
      >
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DashboardHeader>

      {/* Stats Cards — show 4 skeleton cards while loading */}
      <StatsCards
        overview={data?.overview}
        userStats={data?.userStats}
        isLoading={isLoading}
      />

      {/* Charts — lazy-loaded chunk, shows ChartSkeleton until JS arrives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <OverviewSalesChart data={data?.revenueData} isLoading={isLoading} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <OrdersStatusDistChart overview={data?.overview} isLoading={isLoading} />
        </Suspense>
      </div>

      {/* Main content grid — each card manages its own skeleton state */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
        {/* Left column */}
        <div className="lg:col-span-4 space-y-6">
          <RecentOrdersCard
            orders={data?.recentOrders || []}
            isLoading={isLoading}
          />
          <NavigationCards overview={data?.overview} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 space-y-6">
          <QuickActions onRefresh={refresh} />
          <PaymentAnalyticsCard
            analytics={data?.paymentAnalytics}
            isLoading={isLoading}
          />
          <AlertsCard
            alerts={data?.alerts || []}
            isLoading={isLoading}
          />
          <InventoryAlertsCard
            alerts={data?.inventoryAlerts || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
