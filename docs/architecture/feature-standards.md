# Standard Admin Feature Module Blueprint

All admin capabilities in the e-shop workspace must be modularized into self-contained features. This document outlines the standard structural blueprint and step-by-step procedures for adding any new feature.

---

## 1. Feature Folder Architecture

A feature is located inside `features/admin/[feature-name]/`. It must contain the following directories to maintain strict separation of concerns:

```text
features/admin/[feature-name]/
├── api/                        # Feature-specific endpoints and data fetching
│   ├── get-[feature-name].ts   # TanStack Query query hooks
│   └── update-[feature-name].ts # TanStack Query mutation hooks
│
├── components/                 # Presentational and container sub-components
│   ├── [FeatureName]List.tsx   # Sub-component representing tables or lists
│   ├── [FeatureName]Modal.tsx  # Dialogs or modals
│   └── index.ts                # Explicit exports for features/components
│
├── hooks/                      # Feature state orchestration (non-global)
│   └── use-[feature-name]-state.ts
│
├── types/                      # DTOs, interfaces, and validation schemas
│   ├── schema.ts               # Zod validation schema (if form input is needed)
│   └── index.ts                # Typings for the feature API responses
│
└── index.ts                    # PUBLIC INTERFACE (Only export entry view components)
```

> [!IMPORTANT]
> **Strict Encapsulation Rule**
> The `index.ts` at the feature root is the **Public Interface** (API) of the feature. It should ONLY export the main view component (e.g., `export { ProductManagementView } from './components/ProductManagementView'`). Sub-components, API hooks, and types must remain private to the feature and cannot be imported by other parts of the system.

---

## 2. Step-by-Step Feature Implementation Guide

Follow these steps chronologically when creating a new administrative feature:

### Step A: Define Types & Zod Schemas
Create files inside `types/`. Define core types returned by the backend and a Zod schema for input validation:
```typescript
// features/admin/orders/types/index.ts
export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'PENDING' | 'SHIPPED' | 'CANCELLED';
}
```

### Step B: Build API Integration Hooks
Create TanStack Query wrappers in `api/` that use the hardened Axios client:
```typescript
// features/admin/orders/api/get-orders.ts
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/infrastructure/http/axios-client';
import { Order } from '../types';

export function useAdminOrders() {
  return useQuery<Order[]>({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const response = await axiosClient.get('/admin/orders');
      return response.data;
    }
  });
}
```

### Step C: Compose Feature Components
Construct UI in `components/`. The main entry view should orchestrate sub-components (lists, forms, headers):
```typescript
// features/admin/orders/components/OrderManagementView.tsx
import { useAdminOrders } from '../api/get-orders';
import { OrderList } from './OrderList';

export function OrderManagementView() {
  const { data: orders, isLoading } = useAdminOrders();

  if (isLoading) return <div>Loading orders...</div>;
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Order Management</h1>
      <OrderList orders={orders || []} />
    </div>
  );
}
```

### Step D: Register the Feature Public Interface
Export the entry component in the root `index.ts` file:
```typescript
// features/admin/orders/index.ts
export { OrderManagementView } from './components/OrderManagementView';
```

### Step E: Mount to the App Routing Layer
Add the route under `app/(admin)/admin/` and render the exported view. Keep the page file completely thin:
```typescript
// app/(admin)/admin/orders/page.tsx
import { OrderManagementView } from '@/features/admin/orders';

export default function AdminOrdersPage() {
  return <OrderManagementView />;
}
```
