'use client';

import React from 'react';
import { ClipboardList, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminGuard } from '@/core/auth';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';

export default function ReportsPage() {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminPageHeader
          title="Reports"
          description="Detailed reporting and platform data exports"
          icon={ClipboardList}
          actions={
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-10 border rounded-lg bg-background border-dashed text-center">
            <Download className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="font-medium">Sales Report</h3>
            <p className="text-sm text-muted-foreground mb-4">Export comprehensive sales data in CSV or PDF format.</p>
            <Button variant="secondary" size="sm" disabled>Generate</Button>
          </div>
          <div className="p-10 border rounded-lg bg-background border-dashed text-center">
            <Download className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="font-medium">Inventory Audit</h3>
            <p className="text-sm text-muted-foreground mb-4">Download a detailed audit of current stock levels and alerts.</p>
            <Button variant="secondary" size="sm" disabled>Generate</Button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
