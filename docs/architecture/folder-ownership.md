# Folder Ownership & Shared Modification Guidelines

To maintain architectural integrity and prevent code degradation in a multi-team enterprise environment, clear code ownership and modification policies are enforced.

---

## 1. Ownership Matrix

The workspace directories are assigned to specific team domains. No single team should modify another team's domain folder without explicit alignment.

| Directory Path | Primary Owner | Architectural Focus |
| :--- | :--- | :--- |
| `domain/` | Architecture Committee / Core Platform | Enterprise DDD business rules and policies |
| `core/` | Core Platform Engineering | Application lifecycle, cross-cutting hooks/context, validation and auth orchestration |
| `infrastructure/` | Core Platform Engineering | Network, storage, cache systems, Axios, TanStack client |
| `shared/` | Design System / UI Platform | Presentational UI components, form grids, standardized feedback modules |
| `features/admin/products` | Catalog & Merchandising Team | Product management dashboard, catalogs, prices, and listings |
| `features/admin/orders` | Checkout & Fulfillment Team | Order lists, processing, invoice templates, and delivery pipelines |
| `features/admin/users` | IAM & Customer Operations | Staff accounts, customer metrics, permissions, and roles |
| `app/` | Architecture & Routing | Thin orchestration, shell configuration, and Next.js setup |

---

## 2. Rules for Editing Shared Folders (`shared/`, `core/`, `infrastructure/`, `domain/`)

When editing shared directories, you are making changes that affect the entire application. Follow these rules strictly to avoid regression and breaking changes.

> [!CAUTION]
> **No Breaking Changes**
> Shared utilities, generic UI primitives, and domain policies must maintain absolute backward compatibility. You must NOT remove, rename, or change the signatures of existing exported fields or parameters without prior approval.

### Modification Protocols

1. **Review Requirement**
   Any merge request modifying a file in `domain/`, `core/`, `infrastructure/`, or `shared/` MUST receive at least **two approvals** including one from a **Core Platform Engineering** owner.

2. **Add Tests, Don't Guess**
   Any modification to `domain/` rules or `infrastructure/` helpers must be accompanied by comprehensive tests under `e2e/` or equivalent unit testing targets.

3. **Avoid Feature Leakage**
   Never add feature-specific logic to a shared component.
   * *Bad*: Adding a `isProductPage` prop to a shared `<Card />` component to render custom catalog buttons.
   * *Good*: Using standard render props or `children` slots to allow the feature components to compose their specific views inside a clean `<Card />`.

4. **Deprecation Strategy**
   If a shared function or prop is obsolete:
   * Mark it as `@deprecated` in JSDoc.
   * Do not delete it immediately. Ensure all current uses are migrated, then remove the deprecated element in the subsequent scheduled major release.
