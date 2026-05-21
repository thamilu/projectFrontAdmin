# Enterprise Architectural Blueprint: Definitive Technical Map (Admin)

This document is the **Ultimate Source of Truth** for the E-Shop Enterprise Admin workspace directory structures. It meticulously documents every layer of the architecture, ensuring absolute transparency, zero architectural drift, and absolute conformance to strict governance rules.

---

## 🏗️ Directory Map & Hierarchy

```text
eshop_front_admin/
├── ⚙️ [Configuration & Infrastructure Files]
│   ├── .env.local                      # Local developer configuration overrides
│   ├── .dependency-cruiser.js          # STATIC GRAPH ARCHITECTURAL BOUNDARIES
│   ├── eslint.config.mjs               # AUTOMATED LINTING BOUNDARY ENFORCEMENT
│   ├── next.config.ts                  # Next.js compiler and build optimization
│   ├── tailwind.config.ts              # Tailwind CSS Design tokens
│   ├── components.json                 # Shadcn/ui component configuration
│   └── tsconfig.json                   # Path Aliases (@/*) & Compiler rules
│
├── 🏛️ domain/                           # DDD PURE BUSINESS ENTITIES & POLICIES
│   ├── inventory/                      # Inventory domain aggregate
│   │   └── entities/inventory-item.ts  # Rich InventoryItem entity
│   ├── orders/                         # Order domain aggregate
│   │   └── policies/discount-policy.ts # Pure Discount discount calculations
│   └── products/                       # Product domain aggregate
│       └── policies/pricing-policy.ts  # Pure Pricing margin and tax calculations
│
├── 🧱 core/                             # APPLICATION CORE & SECURITY CONTEXT
│   ├── auth/                           # Enterprise identity and RBAC config
│   ├── errors/                         # Standardized system error models
│   ├── observability/                  # Logging and metric reporting contracts
│   ├── security/                       # Encryption, token hashing, and CSRF rules
│   └── validation/                     # Central data schema sanitizers
│
├── 📡 infrastructure/                   # HARDENED PLUG & PLAY ADAPTERS (SIDE EFFECTS)
│   ├── http/                           # Axios client with automatic correlation IDs and retries
│   ├── cache/                          # TanStack Query client configuration and GC policies
│   ├── db/                             # Prisma and direct data connectors
│   ├── payments/                       # Merchant integration adapters (Stripe, Paypal)
│   ├── realtime/                       # WebSocket and Server-Sent Events clients
│   └── search/                         # Elasticsearch / Algolia connectors
│
├── 🧱 shared/                           # REUSABLE UI PRIMITIVES & PRESENTATION BLOCKS
│   ├── ui/                             # Generic presentational items (announcers, banners)
│   ├── forms/                          # Common input structures, dropzones, layout grids
│   ├── table/                          # Reusable high-performance data grids and pagination
│   ├── feedback/                       # Resilient section containers, error-boundaries
│   ├── hooks/                          # Generic non-domain lifecycle hooks (use-network-status)
│   ├── store/                          # Reusable UI states (sidebar toggles)
│   └── utils/                          # Pure functional math, date, and string formatting
│
├── 📂 features/                        # MODULAR VERTICAL FEATURE SLICES
│   └── admin/                          # Administrative Panel Features
│       ├── users/                      # Self-contained IAM & Customer operations
│       ├── products/                   # Catalog oversight and product lists
│       └── orders/                     # Sales, order fulfillment, and metrics
│
├── 🎨 components/                      # ROUTING PROVIDERS & SHADCN PRIMITIVES
│   ├── ui/                             # Shadcn/Radix atomic primitives (Button, Input, Card)
│   ├── layout/                         # Main Sidebar, Header, and Breadcrumb UI
│   ├── providers/                      # Combined React context trees
│   └── NextAuthProvider.tsx            # Session lifecycle orchestrator
│
├── 📂 app/                             # THIN ROUTING SHELL (Zero Domain Logic)
│   ├── (admin)/admin/                  # Dashboards and operational pages
│   │   ├── inventory/                  # Thin wrapper for inventory features
│   │   ├── orders/                     # Thin wrapper for order features
│   │   └── products/                   # Thin wrapper for product features
│   ├── api/                            # Internal Next.js backend proxy controllers
│   ├── layout.tsx                      # Root template wrapper and layout
│   └── page.tsx                        # Admin root redirect landing page
│
├── 📦 lib/                             # RESTRICTED BASIC HELPER FOLDER
│   ├── config/                         # Standard environment configs
│   ├── fonts/                          # Typography files (Inter, Outfit)
│   ├── utils.ts                        # Standard tailwind classes merger (cn)
│   └── formatters.ts                   # String currency / number formatters
│
├── 🧪 e2e/                             # PLAYWRIGHT QUALITY ASSURANCE
│
└── 📁 docs/                            # ARCHITECTURAL GOVERNANCE REGISTRY
    ├── architecture/                   # Strict coding laws (naming, imports, standards)
    └── blueprint/                      # Structural blueprint layouts
```

---

## 🔒 Crucial Architectural Governance Laws

### 1. The Purity of the Domain
Business logic MUST reside inside `domain/`. Files inside `domain/` must be completely pure TypeScript and are **forbidden** from importing any framework libraries, styling elements, or visual modules (such as React, Tailwind classes, Axios clients, Lucide icons, or next.js routing).

### 2. Feature Encapsulation & The Boundary Wall
Every directory inside `features/admin/` is a closed fortress.
* Cross-feature importing is blocked by ESLint boundaries and dependency-cruiser.
* The only item exported from a feature folder is its primary entry view component, via its root `index.ts`. All inner hooks, sub-components, types, and API functions are private to that feature.

### 3. Shared Primitives Isolation
Any item placed in `shared/` must be entirely generic. Presentational components under `shared/ui/` or `shared/feedback/` must **never** import core hooks, axios instances, feature states, or database APIs.

### 4. Thin Route Page Wrappers
Next.js page components (`app/**/page.tsx`) must never execute backend fetches, invoke complex state modifications, or hold nested UI logic. They are simple mounting shells that import and render feature views.
