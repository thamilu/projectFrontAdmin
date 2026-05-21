/**
 * Admin Orders Route
 * Thin wrapper around the Orders feature module.
 */

import { OrderManagementView } from '@/features/admin/orders/components/order-management-view';

export default function AdminOrdersPage() {
  return <OrderManagementView />;
}

