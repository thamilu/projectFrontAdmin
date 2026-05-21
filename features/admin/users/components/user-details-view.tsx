/**
 * User Details View Component
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface UserDetailsViewProps {
  userId: string;
}

export function UserDetailsView({ userId }: UserDetailsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Viewing user ID: {userId}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">User details view coming soon.</p>
      </CardContent>
    </Card>
  );
}
