'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Store,
  BarChart3,
  Settings,
  Boxes,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  LayoutGrid,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  requireAdmin?: boolean;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: 'Dashboard',       href: '/admin',                 icon: LayoutDashboard, requireAdmin: true },
  { title: 'Seller Requests', href: '/admin/seller-requests', icon: UserPlus },
  { title: 'Users',           href: '/admin/users',           icon: Users,           requireAdmin: true },
  { title: 'Orders',          href: '/admin/orders',          icon: ShoppingCart,    requireAdmin: true },
  { title: 'Products',        href: '/admin/products',        icon: Package,         requireAdmin: true },
  { title: 'Shops',           href: '/admin/shops',           icon: Store,           requireAdmin: true },
  { title: 'Inventory',       href: '/admin/inventory',       icon: Boxes,           requireAdmin: true },
  { title: 'Categories',      href: '/admin/categories',      icon: LayoutGrid,      requireAdmin: true },
  { title: 'Payments',        href: '/admin/payments',        icon: CreditCard,      requireAdmin: true },
  { title: 'Analytics',       href: '/admin/analytics',       icon: BarChart3,       requireAdmin: true },
  { title: 'Reports',         href: '/admin/reports',         icon: ClipboardList,   requireAdmin: true },
];

const bottomNavItems: NavItem[] = [
  { title: 'Settings', href: '/admin/settings', icon: Settings, requireAdmin: true },
];

/**
 * Resolve whether the current Next-Auth session belongs to an ADMIN.
 * Checks both session.roles (top-level) and session.user.roles (nested)
 * so it works regardless of where the roles ended up in the JWT callback.
 */
function resolveIsAdmin(session: ReturnType<typeof useSession>['data']): boolean {
  if (!session) return false;

  const topRoles: string[] = session.roles ?? [];
  const userRoles: string[] = session.user?.roles ?? [];
  const allRoles = [...topRoles, ...userRoles].map((r) => String(r).toUpperCase());

  return allRoles.some((r) => r.includes('ADMIN'));
}

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Use useSession directly so we read the raw session object with no extra processing layer
  const { data: session, status } = useSession();

  const isSessionLoading = status === 'loading';
  const isAdmin = resolveIsAdmin(session);

  /**
   * "Sticky" admin flag — once we confirm the user is an admin, never
   * collapse the sidebar back to a single item due to a transient re-render
   * where roles haven't arrived yet.
   */
  const [confirmedAdmin, setConfirmedAdmin] = useState(false);
  useEffect(() => {
    if (isAdmin) {
      Promise.resolve().then(() => {
        setConfirmedAdmin(true);
      });
    }
  }, [isAdmin]);

  // After session loads: show all items if admin (sticky), else filter
  const effectiveIsAdmin = isAdmin || confirmedAdmin;
  
  // Only show as loading while the session is actually resolving.
  // We no longer force loading state if effectiveIsAdmin is false to prevent "infinite skeletons" for non-admins.
  const isLoading = isSessionLoading;

  // Show all items if we are on an admin path OR if the user is confirmed as admin.
  // This prevents the "not showing by default" issue where items only appear after a delay or interaction.
  const showAllItems = effectiveIsAdmin || pathname.startsWith('/admin');

  const filteredNavItems = isLoading || showAllItems
    ? navItems
    : navItems.filter((item) => !item.requireAdmin);

  const filteredBottomItems = isLoading || showAllItems
    ? bottomNavItems
    : bottomNavItems.filter((item) => !item.requireAdmin);

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse Toggle */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 overflow-y-auto">
          <nav className="space-y-1">
            {filteredNavItems.map((item) =>
              isLoading ? (
                <NavSkeleton key={item.href} isCollapsed={isCollapsed} />
              ) : (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={item.href === '/admin' ? pathname === '/admin' : (pathname === item.href || pathname.startsWith(`${item.href}/`))}
                  isCollapsed={isCollapsed}
                />
              )
            )}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t p-3 space-y-1">
          {filteredBottomItems.map((item) =>
            isLoading ? (
              <NavSkeleton key={item.href} isCollapsed={isCollapsed} />
            ) : (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            )
          )}

          <div className="text-xs text-center text-muted-foreground opacity-50 pb-2 mt-2">
            v1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavLink({ item, isActive, isCollapsed }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
      title={isCollapsed ? item.title : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

/** Animated skeleton row shown while the auth session is resolving */
function NavSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <Skeleton className="h-4 w-4 flex-shrink-0 rounded" />
      {!isCollapsed && <Skeleton className="h-4 flex-1 rounded" />}
    </div>
  );
}
