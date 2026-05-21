'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';
import { AdminGuard } from '@/core/auth';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';

export default function PaymentsPage() {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Payments"
          description="Payment history and transaction management"
          icon={CreditCard}
        />

        <div className="p-20 border rounded-lg bg-background border-dashed text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium">Coming Soon</h3>
          <p className="text-muted-foreground">Advanced transaction monitoring and payout management features are under development.</p>
        </div>
      </div>
    </AdminGuard>
  );
}
