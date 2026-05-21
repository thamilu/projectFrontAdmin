'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/core/auth/hooks/use-permissions';
import { APP_ROUTES } from '@/constants';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    requireAdmin?: boolean;
}

/**
 * AdminGuard Component
 * Standardizes authentication and role-based redirection logic.
 * Resides in core/auth/ since it orchestrates active app security.
 */
export function AdminGuard({
    children,
    fallback,
    requireAdmin = true
}: AdminGuardProps) {
    const { isAuthenticated, isAdmin, isLoading } = usePermissions();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push(APP_ROUTES.AUTH.LOGIN);
            return;
        }

        if (requireAdmin && !isAdmin) {
            router.push('/admin');
            return;
        }
    }, [isLoading, isAuthenticated, isAdmin, requireAdmin, router]);

    if (isLoading) {
        return fallback || (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || (requireAdmin && !isAdmin)) {
        return null;
    }

    return <>{children}</>;
}
