# eShop Admin Dashboard

Enterprise-grade administration platform for the eShop ecosystem. Built with Next.js 15, TypeScript, and TanStack Query.

## 🚀 Features

- **Progressive Dashboard**: Real-time business analytics with lazy-loaded charts for optimal performance.
- **Unified Authentication**: Centralized session management via NextAuth and Keycloak SSO.
- **Standardized API**: Robust data fetching with `apiClient`, featuring automatic retries and consistent error handling.
- **High Performance**: 
  - Chart code-splitting (deferred Recharts parsing)
  - Selective hydration with App Router
  - Smart caching with TanStack Query
- **PWA Ready**: Standalone app support with manifest and optimized assets.
- **Accessibility**: WCAG 2.1 compliant with Radix UI primitives and semantic HTML.
- **Internationalization Ready**: Built-in support for RTL/LTR directionality switching.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: 
  - [TanStack Query v5](https://tanstack.com/query) (Server State)
  - [Zustand](https://github.com/pmndrs/zustand) (Client State)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) + [Keycloak](https://www.keycloak.org/)
- **Charts**: [Recharts](https://recharts.org/)

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- npm / pnpm / yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env.local` based on `.env.example`.

3. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

The project follows a feature-based architecture:
- `app/`: Next.js App Router pages and layouts.
- `components/`: Atomic UI components and shared layout elements.
- `hooks/`: Reusable React hooks for auth, data fetching, and UI logic.
- `lib/`: Core utilities, API client, and shared configurations.
- `store/`: Zustand stores for client-side state management.
- `types/`: Global TypeScript definitions.

## 🔒 Security

- CSRF protection via NextAuth.
- XSS prevention with sanitized data rendering.
- Role-Based Access Control (RBAC) enforced at both middleware and hook levels.
- Secure session management with httpOnly cookies.

## 📄 License

Internal eShop Proprietary.
