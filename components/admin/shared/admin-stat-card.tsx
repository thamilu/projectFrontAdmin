'use client';

/**
 * AdminStatCard
 *
 * Shared stat card component used on admin list pages (Users, Orders, etc.)
 * Replaces the locally-defined `StatCard` function repeated across multiple pages.
 *
 * @example
 * ```tsx
 * <AdminStatCard
 *   title="Total Users"
 *   value={totalElements}
 *   description="Across all roles"
 *   icon={Users}
 *   color="text-blue-500"
 * />
 * ```
 */

import { type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminStatCardProps {
  /** Label displayed above the value */
  title: string;
  /** The numeric or string value to display prominently */
  value: number | string;
  /** Optional smaller description below the value */
  description?: string;
  /** Optional Lucide icon shown in the card header */
  icon?: LucideIcon;
  /** Optional Tailwind text-color class (e.g. 'text-blue-500') */
  color?: string;
  /** Optional click handler */
  onClick?: () => void;
}

export function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  onClick,
}: AdminStatCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : undefined}
      onClick={onClick}
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          {Icon && (
            <Icon className={`h-4 w-4 ${color ?? 'text-muted-foreground'}`} />
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`text-2xl font-bold ${color ?? ''}`}>{value}</div>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
