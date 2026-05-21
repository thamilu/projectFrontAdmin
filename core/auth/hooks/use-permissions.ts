import { useMemo, useCallback } from 'react';
import { useAuth, type AuthUser } from './use-auth';
import { UserRole } from '@/types/index';

interface UsePermissionsReturn {
  user: AuthUser | null;
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

  const permissions = useMemo(() => {
    return user?.permissions ?? [];
  }, [user]);

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
