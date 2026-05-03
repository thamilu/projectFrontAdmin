'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, CheckCircle, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { AdminUser } from '@/features/admin/types';
import { USER_ROLES, SHOP_STATUS } from '@/constants';

interface ColumnProps {
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
}

export const getColumns = ({
  onView,
  onEdit,
  onToggleStatus,
}: ColumnProps): ColumnDef<AdminUser>[] => [
  {
    accessorKey: 'fullName',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          <div>
            <div className="font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone || 'N/A',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.role;
      const formatRole = (r: string) => r.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
      
      const getRoleBadgeColor = (r: string) => {
        switch (r) {
          case USER_ROLES.ADMIN: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
          case USER_ROLES.SELLER: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          case USER_ROLES.DELIVERY_AGENT: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          case USER_ROLES.CUSTOMER: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
      };

      return (
        <Badge className={getRoleBadgeColor(role)}>
          {formatRole(role)}
        </Badge>
      );
    },
  },
  {
    id: 'sellerType',
    header: 'Seller Type',
    cell: ({ row }) => {
      const user = row.original;
      if (user.role === USER_ROLES.SELLER && user.shop?.sellerType) {
        return (
          <StatusBadge status={user.shop.sellerType} />
        );
      }
      return <span className="text-sm text-muted-foreground">N/A</span>;
    },
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.original.active ? SHOP_STATUS.ACTIVE : SHOP_STATUS.SUSPENDED} />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(user)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(user.id, user.active)}
          >
            {user.active ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </Button>
        </div>
      );
    },
  },
];
