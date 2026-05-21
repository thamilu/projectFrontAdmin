/**
 * Admin Users Route
 * Thin wrapper around the Users feature module.
 */

import { UserManagementView } from '@/features/admin/users/components/user-management-view';

export default function AdminUsersPage() {
  return <UserManagementView />;
}

