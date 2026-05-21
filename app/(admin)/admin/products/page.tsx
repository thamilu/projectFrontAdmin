/**
 * Admin Products Route
 * Thin wrapper around the Products feature module.
 */

import { ProductManagementView } from '@/features/admin/products/components/product-management-view';

export default function AdminProductsPage() {
  return <ProductManagementView />;
}
