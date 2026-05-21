'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { UserRole } from '@/types/index';
import { useMemo } from 'react';

export interface AuthUser {
    id: string;
    email?: string;
    name?: string;
    username?: string;
    image?: string;
    role: UserRole;
    permissions?: string[];
}

export function useAuth() {
    const { data: session, status, update } = useSession();

    const user = useMemo<AuthUser | null>(() => {
        if (!session?.user) return null;

        // Extract roles from various possible locations in the session object
        const userRoles = session.user.roles || [];
        const sessionRoles = session.roles || [];
        const allRoles = [...(Array.isArray(userRoles) ? userRoles : []), ...(Array.isArray(sessionRoles) ? sessionRoles : [])];

        const upperRoles = allRoles.map((r) => String(r).toUpperCase());

        // Determine primary role for the admin dashboard
        let primaryRole: UserRole = 'VIEWER' as UserRole;
        if (upperRoles.some(r => r.includes('ADMIN'))) primaryRole = UserRole.ADMIN;
        else if (upperRoles.includes('SELLER')) primaryRole = UserRole.SELLER;
        else if (upperRoles.includes('DELIVERY_AGENT')) primaryRole = UserRole.DELIVERY_AGENT;
        else if (upperRoles.includes('CUSTOMER')) primaryRole = UserRole.CUSTOMER;

        return {
            id: session.user.id || '',
            email: session.user.email || undefined,
            name: session.user.name || undefined,
            username: session.user.username || undefined,
            image: session.user.image || undefined,
            role: primaryRole,
            permissions: session.user.permissions || [],
        };
    }, [session]);

    return {
        user,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
        login: (callbackUrl?: string) => signIn('keycloak', { callbackUrl }),
        logout: () => signOut({ callbackUrl: window.location.origin }),
        update,
    };
}


export function useRequireAuth() {
    const { isAuthenticated, user, isLoading } = useAuth();

    // Redirect handling is primarily done by middleware, 
    // but client-side checks can be added here if needed.

    return { isLoading, user, isAuthenticated };
}

export function useRequireRole(requiredRole: UserRole) {
    const { user, isAuthenticated, isLoading } = useAuth();

    const isAuthorized = useMemo(() => {
        if (isLoading || !isAuthenticated) return false;
        return user?.role === requiredRole || user?.role === UserRole.ADMIN;
    }, [user?.role, isAuthenticated, isLoading, requiredRole]);

    return { isAuthorized, isLoading };
}
