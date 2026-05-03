'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    requireAdmin?: boolean;
}

/**
 * AdminGuard Component
 * Standardizes authentication and role-based redirection logic.
 * Replaces repeated useEffect auth checks in page components.
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
            // Use next-auth signIn instead of manual redirect to non-existent page
            router.push('/');
            return;
        }

        if (requireAdmin && !isAdmin) {
            // Redirect to a safe page if user is authenticated but not an admin
            router.push('/admin/dashboard');
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

    // Only render children if validated
    if (!isAuthenticated || (requireAdmin && !isAdmin)) {
        return null;
    }

    return <>{children}</>;
}
