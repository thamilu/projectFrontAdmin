# CSS Architecture & Styling Conventions

This document outlines the official CSS styling conventions and architectural design rules for the E-Shop Admin application. All developers must strictly follow these rules to maintain high visual fidelity, fast build performance, theme consistency, and robust UI modularity.

---

## 1. Styling Core Technology Stack

- **Primary CSS Engine**: **Tailwind CSS 4** utility framework.
- **Theme Orchestrator**: `next-themes` for class-based theme injection (injects `.dark` class on the `<html>` or `<body>` element).
- **Prohibited Technologies**:
  - **CSS Modules** (`*.module.css`): Strongly prohibited to prevent multiple overlapping styling systems and reduce bundle sizes.
  - **Sass/SCSS**: Strongly prohibited. All custom variables, utilities, and components should be written using modern CSS custom properties and Tailwind utilities.
  - **CSS-in-JS Libraries** (e.g., Styled Components, Emotion): Strongly prohibited due to runtime rendering overhead.

---

## 2. Design Token Management

All design values (colors, spacing, typography sizes, shadows, borders, motion timings) must be declared and managed through the central design system:

1. **System Constants**: Define primary spacing scales, motion timings, and core accessibility flags inside `@/design-system/tokens/`.
2. **Tailwind Configurations**: Bind design tokens to standard utility classes within `tailwind.config.ts` or directly within the Tailwind 4 theme directive.
3. **CSS Variables**: Declare semantic variables inside `app/globals.css` that adapt automatically based on active theme classes.

---

## 3. Strict Rules & Constraints

### Rule A: CSS Custom Properties Sourced via `globals.css`
Theme-level values, variable color tokens, and layout dimensions must be declared as standard CSS custom properties under root and dark-mode selectors inside `app/globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
}
```

### Rule B: Zero Inline Styles
Inline styles (`style={{ ... }}`) are strictly prohibited because they bypass compiler optimizations and violate CSP restrictions.
- **Allowed Exception**: Highly dynamic runtime values (e.g., precise mouse tracking, drag-and-drop translations, progress bar widths, or user-configurable colors).
```tsx
// ❌ WRONG (Static styling in inline style)
<div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f3f4f6' }}>...</div>

// ✅ CORRECT (Tailwind utility classes)
<div className="p-4 rounded-lg bg-muted">...</div>

// ✅ CORRECT (Dynamic value exception)
<div style={{ width: `${progressPercent}%` }} className="h-full bg-primary" />
```

### Rule C: Utility-First Rigor over Custom Classes
Write custom class names in components only when standard Tailwind utilities do not satisfy layout or styling goals.
- Avoid building complex utility overrides. If you need a reusable styled component, create a modular React component in your feature domain or `@/components/ui/` rather than writing static CSS class rules.
```tsx
// ❌ WRONG (Writing custom static class in CSS file)
// .custom-button { @apply px-4 py-2 bg-blue-500 text-white rounded-md; }
<button className="custom-button">Click me</button>

// ✅ CORRECT (Composition in React Component using Tailwind utilities)
export function Button({ children, ...props }: ButtonProps) {
  return (
    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors" {...props}>
      {children}
    </button>
  );
}
```

### Rule D: Respect Theme and Accessibility Tokens
Utilize predefined theme states (`dark:`, `motion-safe:`, `motion-reduce:`, `forced-colors:`) to maintain robust user experience parameters:
- Always use `motion-safe:` or transition delays for premium micro-animations.
- Use `forced-colors:` modifiers to support Windows High Contrast mode.

---

## 4. Folder Hierarchy for Styles

```
app/
├── globals.css         # Reset styles, typography base, CSS custom properties
design-system/
├── tokens/             # Spacing, colors, motion, variants
├── themes/             # Theme provider, context, and custom configuration hooks
docs/
└── architecture/
    └── css-conventions.md  # Architectural guidelines (this document)
```
