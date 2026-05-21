# Technical Import Boundaries & Layer Rules

Strict structural isolation and clear dependency directions are crucial for high-scaling enterprise applications. This registry defines the rules of imports for the workspace layers, as enforced by `eslint-plugin-boundaries` and `dependency-cruiser`.

---

## The Dependency Hierarchy

Imports must flow downwards in a strictly controlled direction. High-level orchestrators and presentation boundaries may depend on lower-level business and core utility layers, but lower-level layers must **never** reference higher-level ones.

```text
       ┌───────────────┐
       │   app/ (App)  │
       └───────┬───────┘
               │
       ┌───────▼─────────────┐
       │ features/ (Feature) │
       └───────┬─────────────┘
               │
     ┌─────────┼─────────────────────────┐
     ▼         ▼                         ▼
┌──────────┐┌──────────────────────┐┌────────────┐
│shared/   ││infrastructure/ (Infra)││core/ (Core)│
└────┬─────┘└──────────┬───────────┘└─────┬──────┘
     │                 │                  │
     └─────────────────┼──────────────────┘
                       ▼
               ┌───────────────┐
               │ domain/ (Pure)│
               └───────────────┘
```

---

## Layer Definitions & Rules

### 1. Pure Domain (`domain/`)
* **Purpose**: Core business models, entities, pure domain policies, and calculations (DDD).
* **Allowed Imports**: Can only import from **other files in `domain/`**.
* **Forbidden Imports**: Cannot import from `core/`, `infrastructure/`, `shared/`, `features/`, or `app/`.
* **UI Purity**: Absolute zero dependencies on UI packages (e.g., `react`, `react-dom`, `lucide-react`, `next`). Under no circumstances may React components, hooks, or visual assets enter the `domain/` directory.

### 2. Core Application Utilities (`core/`)
* **Purpose**: Core application setup, global state definitions, custom contexts, cross-cutting validations, error definitions, and global hook/security contexts.
* **Allowed Imports**: `domain/` and `core/`.
* **Forbidden Imports**: Cannot import from `infrastructure/`, `shared/`, `features/`, or `app/`.

### 3. Hardened Infrastructure (`infrastructure/`)
* **Purpose**: Concrete adapters for side effects (e.g., HTTP clients, TanStack Query clients, analytical instrumentation).
* **Allowed Imports**: `domain/`, `core/`, and `infrastructure/`.
* **Forbidden Imports**: Cannot import from `shared/`, `features/`, or `app/`.

### 4. Shared UI Primitives (`shared/`)
* **Purpose**: Pure, reusable design system components, forms, tables, and feedback modules. This layer contains no knowledge of application domain logic or database storage APIs.
* **Allowed Imports**: `domain/` (strictly for global type/constant contracts) and other `shared/` directories.
* **Forbidden Imports**: Cannot import from `core/`, `infrastructure/`, `features/`, or `app/`. (e.g., A shared button or modal must never import an Axios client or query client directly).

### 5. Encapsulated Features (`features/`)
* **Purpose**: Modular, domain-driven vertical slices of the administration capabilities (e.g. `features/admin/users`, `features/admin/orders`).
* **Allowed Imports**: `domain/`, `core/`, `infrastructure/`, `shared/`, and *internal feature files* (within its own sub-folder).
* **Forbidden Cross-Feature Imports**: A feature **must not** import anything from another feature folder.
  * *Correct*: `features/admin/orders/components/order-list.tsx` imports from `features/admin/orders/hooks/use-orders.ts`
  * *Incorrect*: `features/admin/orders/components/order-list.tsx` imports from `features/admin/products/...`
  * If a utility or module is required by multiple features, it must be hoisted into a lower shared layer (`core/`, `infrastructure/`, or `shared/`).

### 6. Thin Routing Layer (`app/`)
* **Purpose**: Routing structure, layout compositions, page shells, global providers integration.
* **Allowed Imports**: Can import from any layer to compose the final application (`domain/`, `core/`, `infrastructure/`, `shared/`, `features/`, `app/`).
* **Clean Page Rule**: Page files (`page.tsx`) must remain ultra-thin wrappers that render feature entry components. No direct data fetching or complex business hooks should be called inside a `page.tsx` directly.
