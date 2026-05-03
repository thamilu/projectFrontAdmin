import { useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/auth';

interface UsePermissionsReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  permissions: string[];
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, isLoading, isAuthenticated } = useAuth();

  const role = useMemo(() => {
    if (isLoading || !user) return null;
    return user.role;
  }, [user, isLoading]);

  const permissions: string[] = user?.permissions ?? [];

  const hasRole = useCallback(
    (requiredRoles: UserRole | UserRole[]): boolean => {
      if (!role) return false;
      const reqRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      return reqRoles.includes(role);
    },
    [role]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (role === UserRole.ADMIN) return true;
      // Implement specific logic here if needed, or rely on 'permissions' array from user
      return permissions.includes(permission);
    },
    [role, permissions]
  );

  const isAdmin = role === UserRole.ADMIN;
  const isSuperAdmin = role === UserRole.ADMIN; // For now, admin is super admin

  return {
    user,
    isLoading,
    isAuthenticated,
    role,
    permissions,
    hasRole,
    hasPermission,
    isAdmin,
    isSuperAdmin,
  };
}
