'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function AdminProductDetailsPage() {
  const params = useParams();
  const productId = params?.id as string;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
        <CardDescription>Viewing product ID: {productId}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Product details view coming soon.</p>
      </CardContent>
    </Card>
  );
}
