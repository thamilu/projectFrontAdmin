/**
 * Canonical Admin Dashboard Route
 * 
 * This is the primary entry point for the Admin dashboard. 
 * Rather than redirecting, it directly renders the `<AdminDashboard />` 
 * component from the `@/features/admin/analytics` domain, serving as 
 * the single source of truth for the dashboard view since `/admin/dashboard` 
 * was decommissioned.
 */

import { AdminDashboard } from '@/features/admin/analytics/components';

export default function AdminPage() {
  return <AdminDashboard />;
}

