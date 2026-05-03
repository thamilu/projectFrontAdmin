'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { SHOP_STATUS, ORDER_STATUS } from '@/constants';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * StatusBadge Component
 * Standardizes status indicators across the admin panel.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toUpperCase();

  const getStatusConfig = () => {
    switch (s) {
      case SHOP_STATUS.ACTIVE:
      case ORDER_STATUS.DELIVERED:
      case ORDER_STATUS.CONFIRMED:
      case 'APPROVED':
      case 'SUCCESS':
        return {
          label: status,
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100',
          icon: CheckCircle
        };
      case 'REJECTED':
      case 'FAILED':
        return {
          label: status,
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100',
          icon: XCircle
        };
      case ORDER_STATUS.PENDING:
      case ORDER_STATUS.PROCESSING:
      case ORDER_STATUS.SHIPPED:
      case SHOP_STATUS.PENDING_REVIEW:
      case 'UNDER_REVIEW':
        return {
          label: status,
          variant: 'secondary' as const,
          className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-100',
          icon: Clock
        };
      case 'NEEDS_MORE_INFO':
      case 'LOW_STOCK':
      case 'CRITICAL':
        return {
          label: status,
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-100',
          icon: AlertCircle
        };
      default:
        return {
          label: status,
          variant: 'outline' as const,
          className: '',
          icon: null
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn("gap-1.5 px-2.5 py-0.5 font-medium", config.className, className)}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}
