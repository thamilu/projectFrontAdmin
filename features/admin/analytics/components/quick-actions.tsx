'use client';

import Link from 'next/link';
import { Plus, Upload, Download, RefreshCw, FileSpreadsheet, PlusCircle, FileText } from 'lucide-react';
import { APP_ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export function QuickActions({ onRefresh, onExport }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href={`${APP_ROUTES.ADMIN.PRODUCTS}/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href={APP_ROUTES.ADMIN.IMPORT}>
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href={APP_ROUTES.ADMIN.REPORTS}>
              <FileText className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
