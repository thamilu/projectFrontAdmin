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
          className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20',
          icon: CheckCircle
        };
      case 'REJECTED':
      case 'FAILED':
        return {
          label: status,
          variant: 'destructive' as const,
          className: 'bg-rose-500/10 text-rose-500 border-rose-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:bg-rose-500/20',
          icon: XCircle
        };
      case ORDER_STATUS.PENDING:
      case ORDER_STATUS.PROCESSING:
      case ORDER_STATUS.SHIPPED:
      case SHOP_STATUS.PENDING_REVIEW:
      case 'UNDER_REVIEW':
      case 'PENDING':
        return {
          label: status,
          variant: 'secondary' as const,
          className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.1)] animate-pulse hover:bg-amber-500/20',
          icon: Clock
        };
      case 'NEEDS_MORE_INFO':
      case 'LOW_STOCK':
      case 'CRITICAL':
        return {
          label: status,
          variant: 'secondary' as const,
          className: 'bg-orange-500/10 text-orange-500 border-orange-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:bg-orange-500/20',
          icon: AlertCircle
        };
      default:
        return {
          label: status,
          variant: 'outline' as const,
          className: 'bg-slate-500/10 text-slate-400 border-slate-500/20 backdrop-blur-sm',
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
