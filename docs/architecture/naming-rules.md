# Technical Naming Conventions & Rules

Strict, unified naming conventions are enforced across the admin workspace to prevent architectural degradation and facilitate automated tool integration.

---

## 1. Directory & File Naming (Kebab-Case)

All physical folders and files in the workspace (excluding React components themselves) MUST use **kebab-case** (lowercase words separated by hyphens).
* **Correct**: `use-auth.ts`, `prisma-client.ts`, `product-form-schema.ts`, `seller-requests/`
* **Incorrect**: `useAuth.ts`, `prismaClient.ts`, `productFormSchema.ts`, `sellerRequests/`

### React Component Files (kebab-case or PascalCase)
While base functions use kebab-case, physical React component files MUST use **PascalCase** matching the exported component name exactly to ensure Next.js routing and UI components render correctly.
* **Correct**: `UserNav.tsx`, `Sidebar.tsx`, `ResilientSection.tsx`
* **Incorrect**: `userNav.tsx`, `sidebar.tsx`, `resilient_section.tsx`

---

## 2. Code Identifiers & Nomenclature

### React Components (PascalCase)
All React component functional exports must use **PascalCase**.
* **Correct**: `export function OrderManagementView() { ... }`

### React Hooks (camelCase)
All hooks must use **camelCase** starting with the prefix `use` (e.g. `use[Name]`).
* **Correct**: `usePagedResource`, `useAuth`, `usePermissions`

### Domain Entities & Policies (PascalCase)
All pure business logic entities and policy classes must use **PascalCase**.
* **Correct**: `class InventoryItem`, `class VipDiscountPolicy`

### Variables, Functions, & Properties (camelCase)
All variables, function signatures, and properties must use **camelCase**.
* **Correct**: `const totalAmount = 0;`, `function calculateTotal() { ... }`

### Constants & Enums (UPPER_SNAKE_CASE)
All static, immutable configurations, lookup structures, and TypeScript enums must use **UPPER_SNAKE_CASE**.
* **Correct**: `export enum UserRole { ADMIN = 'ADMIN' }`, `export const TAX_RATE = 0.18;`
