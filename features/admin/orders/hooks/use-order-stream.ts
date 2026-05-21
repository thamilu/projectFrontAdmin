'use client'

import { useMemo } from 'react'
import { useSSE } from '@/infrastructure/realtime/hooks/use-sse'

/**
 * Hook for order updates via SSE
 */
export function useOrderStream(orderId: string | null) {
  const url = orderId ? `/api/orders/${orderId}/stream` : null

  type OrderStreamPayload = {
    type: 'connected' | 'update'
    data?: Record<string, unknown>
    orderId?: string
    timestamp: string
  }

  const { data, isConnected, error } = useSSE<OrderStreamPayload>(url)

  const status = useMemo(() => {
    if (data?.type === 'update' && data.data?.status && typeof data.data.status === 'string') {
      return data.data.status;
    }
    return null;
  }, [data]);

  const tracking = useMemo(() => {
    if (data?.type === 'update' && data.data?.tracking && typeof data.data.tracking === 'object') {
      return data.data.tracking as Record<string, unknown>;
    }
    return null;
  }, [data]);

  return {
    status,
    tracking,
    isConnected,
    error,
    lastUpdate: data?.timestamp,
  }
}
