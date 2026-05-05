'use client';

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

/**
 * AdminPageHeader Component
 * Provides a standardized header for admin management pages.
 */
export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-3 bg-card border border-border/50 rounded-xl shadow-2xl backdrop-blur-xl">
              <Icon className="h-7 w-7 text-primary" />
            </div>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-left font-medium max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
