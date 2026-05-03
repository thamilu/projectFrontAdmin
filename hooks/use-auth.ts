'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export interface AuthUser {
    id: string;
    email?: string;
    name?: string;
    username?: string;
    image?: string;
    role: UserRole;
}

export function useAuth() {
    const { data: session, status, update } = useSession();

    const user = useMemo<AuthUser | null>(() => {
        if (!session?.user) return null;

        // Extract roles from various possible locations in the session object
        const userRoles = (session?.user as any)?.roles || [];
        const sessionRoles = (session as any)?.roles || [];
        const allRoles = [...(Array.isArray(userRoles) ? userRoles : []), ...(Array.isArray(sessionRoles) ? sessionRoles : [])];

        const upperRoles = allRoles.map((r: any) => String(r).toUpperCase());

        // Determine primary role for the admin dashboard
        let primaryRole: UserRole = 'VIEWER' as UserRole;
        if (upperRoles.some(r => r.includes('ADMIN'))) primaryRole = UserRole.ADMIN;
        else if (upperRoles.includes('SELLER')) primaryRole = UserRole.SELLER;
        else if (upperRoles.includes('DELIVERY_AGENT')) primaryRole = UserRole.DELIVERY_AGENT;
        else if (upperRoles.includes('CUSTOMER')) primaryRole = UserRole.CUSTOMER;

        return {
            id: (session.user as any).id || '',
            email: session.user.email || undefined,
            name: session.user.name || undefined,
            username: (session.user as any).username || undefined,
            image: session.user.image || undefined,
            role: primaryRole,
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
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();

    // Redirect handling is primarily done by middleware, 
    // but client-side checks can be added here if needed.

    return { isLoading, user, isAuthenticated };
}

export function useRequireRole(requiredRole: UserRole) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Handled by middleware mostly, but good for dual check
            // signIn('keycloak');
            return;
        }

        if (user?.role !== requiredRole && user?.role !== UserRole.ADMIN) {
            // Optional: Redirect or just set unauthorized
        } else {
            setIsAuthorized(true);
        }
    }, [user, isAuthenticated, requiredRole, router, isLoading]);

    return { isAuthorized, isLoading };
}
