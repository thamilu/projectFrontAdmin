/**
 * Admin Shops Hook
 * Hook for managing stores/shops in the admin panel
 */

'use client';

import { AdminShop, ShopFilters } from '../types';
import { getShops, searchShops } from '../api';
import { usePagedResource } from './use-paged-resource';

export const ADMIN_SHOPS_QUERY_KEY = ['admin', 'shops'];

export function useAdminShops(
  initialFilters: ShopFilters = { page: 0, size: 10, sortBy: 'shopName' }
) {
  const { items: shops, ...tableState } = usePagedResource<ShopFilters, AdminShop>({
    queryKey: ADMIN_SHOPS_QUERY_KEY,
    queryFn: (params) => {
      const keyword = (params as ShopFilters & { keyword?: string }).keyword ?? '';
      return keyword.trim() ? searchShops(keyword, params) : getShops(params);
    },
    initialFilters,
    initialSortBy: initialFilters.sortBy,
    initialKeyword: initialFilters.keyword,
  });

  return { shops, ...tableState };
}
