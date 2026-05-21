'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id as string;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>Viewing order ID: {orderId}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Order details view coming soon.</p>
      </CardContent>
    </Card>
  );
}
