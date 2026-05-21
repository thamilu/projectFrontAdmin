/**
 * Admin User Details Route
 * Thin wrapper around the Users feature module.
 */

'use client';

import { useParams } from 'next/navigation';
import { UserDetailsView } from '@/features/admin/users/components/user-details-view';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const userId = params?.id as string;

  return <UserDetailsView userId={userId} />;
}
